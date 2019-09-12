import { Directive, OnInit, ElementRef, Input } from '@angular/core';
import * as d3 from "d3";
import { Observable } from 'rxjs';
import { ChartBasicType } from '../interface/chart-basic-type';

@Directive({
  selector: '[appPieChart]'
})
export class PieChartDirective implements OnInit {

  @Input('appPieChart') obsData: Observable<ChartBasicType[]>
  @Input() width: number = 600
  @Input() height: number = 360
  @Input() inner: number = 0
  readonly margin: number = 10
  radius: number

  data: ChartBasicType[]
  names: string[]
  values: number[]

  host: d3.Selection<HTMLElement, unknown, null, undefined>
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  g: d3.Selection<SVGGElement, unknown, null, undefined>
  tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>

  // 円グラフ計算式
  pie = d3.pie().sort(null)
  // カラーリング
  pieColor = d3.scaleOrdinal(d3.schemePastel1)
  // データ描画値
  dataArc: d3.Arc<any, d3.PieArcDatum<any>>
  // データラベル描画値
  textArc: d3.Arc<any, d3.PieArcDatum<any>>

  // 初回判定フラグ
  flg: boolean

  constructor(
    private el: ElementRef
  ) { }

  ngOnInit() {
    // 親要素
    this.host = d3.select(this.el.nativeElement)
    // svg追加
    this.svg = this.host.append('svg')
    .attr('width', this.width)
    .attr('height', this.height)
    .style('border', '1px solid #000000')
    // tooltip追加
    this.addTooltip()

    this.obsData.subscribe(data => {
      this.data = data
      // データ変更の場合、要素を削除
      if(this.flg) this.remove()
      this.setup()
      this.draw()
      if(!this.flg) this.flg = true
    })
  }

  /**
   * tooltip用div追加
   *
   * @private
   * @memberof PieChartDirective
   */
  private addTooltip() {
    this.tooltip = this.host.append('div')
    .style('visibility', 'hidden')
    .style('position', 'absolute')
    .style('top', 0)
    .style('left', 0)
    .style('width', 80 + 'px')
    .style('height', 48 + 'px')
    .style('background-color', '#AAAAAA')
    .style('border-radius', 5 + 'px')
    .style('opacity', '0.9')
    .style('box-shadow', '4px 4px 6px 2px rgba(0, 0, 0, 0.9')
    .style('color', '#FFFFFF')
    .style('text-align', 'center')
    .style('display', 'table-cell')
    .style('vertical-align', 'middle')
    .style('z-index', '999')
  }

  /**
   * データ加工や計算式設定
   *
   * @private
   * @memberof PieChartDirective
   */
  private setup() {
    // 半径
    this.radius = Math.min(this.width, this.height) / 2
    // 円描画用式
    this.dataArc = d3.arc<any, d3.PieArcDatum<any>>()
    .outerRadius(this.radius - this.margin).innerRadius(this.inner)
    // データラベル描画用式
    this.textArc = d3.arc<any, d3.PieArcDatum<any>>()
    .outerRadius(this.radius + 20).innerRadius(0)
    // データ加工
    this.names = this.data.map(temp => temp.name)
    this.values = this.data.map(temp => temp.value)
  }

  /**
   * 描画
   *
   * @private
   * @memberof PieChartDirective
   */
  private draw() {
    const sum = d3.sum(this.values)

    // グラフ描画用グループ追加
    this.g = this.svg.append('g')
    .attr('transform', `translate(${this.width / 2}, ${this.height / 2})`)

    // データ投入
    let path = this.g.selectAll('path')
    .data(this.pie(this.values))

    // 各データ描画path追加
    path.enter()
    .append('path')
    .attr('fill', (d, i, n) => this.pieColor(i.toString()))
    .attr('stroke', '#FFFFFF')
    // tooltip表示
    .on('mouseenter', (d, i, n) => {
      const x = n[i].getBoundingClientRect().left
      const y = n[i].getBoundingClientRect().top + window.scrollY
      this.tooltip
      .style('visibility', 'visible')
      .style('left', x + 'px')
      .style('top', y + 'px')
      .html(this.names[i] + '<br>' + d.value)
      .on('mouseenter', () => this.tooltip.style('visibility', 'visible'))
      .on('mouseleave', () => this.tooltip.style('visibility', 'hidden'))
    })
    .on('mouseleave', () => this.tooltip.style('visibility', 'hidden'))
    // アニメーション表示
    .transition()
    .duration(300)
    .ease(d3.easeLinear)
    .attrTween('d', (d, i, n) => {
      const interpolate = d3.interpolate<any>(
        { startAngle: d.startAngle, endAngle: d.startAngle },
        { startAngle: d.startAngle, endAngle: d.endAngle }
      )
      return (t) => this.dataArc(interpolate(t))
    })

    // ラベル追加
    path.enter()
    .append('text')
    .attr('transform', (d, i, n) => `translate(${this.textArc.centroid(d)})`)
    .attr("font-size", "20px")
    .attr('text-anchor', 'middle')
    .text(text => Math.round(text.value / sum * 100 * 10) / 10 + '%')
    .on('mouseover', () => this.tooltip.style('visibility', 'visible'))
    .on('mouseleave', () => this.tooltip.style('visibility', 'hidden'))

    this.drawLegend()
  }

  /**
   * 凡例描画
   *
   * @private
   * @memberof PieChartDirective
   */
  private drawLegend() {
    // legend用グループ追加
    let legend = this.svg.append('g')
    .selectAll('rect')
    .data(this.names)
    .attr('x', 20)

    // legend用rect追加
    legend.enter()
    .append('rect')
    .attr('x', 20)
    .attr('y', 20)
    .attr('width', 10)
    .attr('height', 10)
    .attr('transform', (d, i, n) => `translate(0, ${i * 20})`)
    .attr('fill', (d, i, n) => this.pieColor(i.toString()))

    // legend用ラベル追加
    legend.enter()
    .append('text')
    .attr('x', 40)
    .attr('y', 30)
    .attr('width', 10)
    .attr('height', 10)
    .attr('transform', (d, i) => `translate(0, ${i * 20})`)
    .text(text => text)
  }

  /**
   * グラフ描画グループ削除
   *
   * @private
   * @memberof PieChartDirective
   */
  private remove() {
    this.svg.selectAll('g').remove()
  }
}
