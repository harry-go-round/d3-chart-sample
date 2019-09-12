import { Directive, OnInit, Input, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { ChartBasicType } from '../interface/chart-basic-type';
import { Observable } from 'rxjs';

@Directive({
  selector: '[appBarChart]'
})
export class BarChartDirective implements OnInit {

  @Input('appBarChart') obsData: Observable<ChartBasicType[]>
  @Input() width: number = 600
  @Input() height: number = 360
  margin = { top: 30, right: 30, bottom: 30, left: 30 }

  data: ChartBasicType[]

  host: d3.Selection<HTMLElement, unknown, null, undefined>
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  g: d3.Selection<SVGGElement, unknown, null, undefined>
  tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>

  // グラフ描画用サイズ
  gWidth: number
  gHeight: number

  // x軸
  xScale: d3.ScaleBand<string>
  // y軸
  yScale: d3.ScaleLinear<number, number>

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
   * @memberof ColumnChartDirective
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
   * @memberof ColumnChartDirective
   */
  private setup() {
    // グラフ描画用サイズ
    this.gWidth = this.width - (this.margin.left + this.margin.right)
    this.gHeight = this.height - (this.margin.top + this.margin.bottom)

    // x軸計算用
    this.xScale = d3.scaleBand()
    .range([ 0, this.gWidth ])
    .domain(this.data.map(temp => temp.name))
    .padding(0.2)
    
    // 目盛り用最大値
    let max = d3.max(this.data.map(temp => temp.value))
    
    // y軸計算用
    this.yScale = d3.scaleLinear()
    .range([ this.gHeight, 0 ])
    .domain([ 0, max ])
    .nice()
  }

  /**
   * 描画
   *
   * @private
   * @memberof ColumnChartDirective
   */
  private draw() {
    // グラフ描画用グループ追加
    this.g = this.svg.append('g')
    .attr('width', this.gWidth)
    .attr('height', this.gHeight)
    .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)

    // x軸ラベル描画
    this.g.append('g')
    .attr('transform', `translate(0, ${this.gHeight})`)
    .call(d3.axisBottom(this.xScale))
    // y軸ラベル、グリッド描画
    this.g.append('g')
    .attr('transform', `translate(0, 0)`)
    .call(
      d3.axisLeft(this.yScale)
      .tickSize(- this.gWidth)
      .tickFormat(null)
    )

    // データseries描画
    this.g.selectAll('rect')
    .data(this.data)
    .enter()
    .append('rect')
    .attr('width', this.xScale.bandwidth())
    .attr('x', (d, i, n) => this.xScale(d.name))
    .attr('y', this.height)
    .attr('fill', '#0080FF')
    .attr('opacity', '0.8')
    // tooltip表示
    .on('mouseenter', (d, i, n) => {
      const x = n[i].getBoundingClientRect().left
      const y = n[i].getBoundingClientRect().top + window.scrollY
      this.tooltip
      .style('visibility', 'visible')
      .style('left', x + 'px')
      .style('top', y + 'px')
      .html(d.name + '<br>' + d.value)
      .on('mouseenter', () => this.tooltip.style('visibility', 'visible'))
      .on('mouseleave', () => this.tooltip.style('visibility', 'hidden'))
    })
    .on('mouseleave', () => this.tooltip.style('visibility', 'hidden'))
    // アニメーション表示
    .transition()
    .duration(500)
    .attr('y', (d, i, n) => this.yScale(d.value))
    .attr('height', (d, i, n) => this.gHeight - this.yScale(d.value))
  }

  /**
   * グラフ描画グループ削除
   *
   * @private
   * @memberof BarChartDirective
   */
  private remove() {
    this.svg.selectAll('g').remove()
  }

}
