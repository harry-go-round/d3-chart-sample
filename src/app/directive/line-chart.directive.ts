import { Directive, OnInit, Input, ElementRef } from '@angular/core';
import * as d3 from "d3";
import { ChartStackedType } from '../interface/chart-stacked-type';
import { Observable } from 'rxjs';

@Directive({
  selector: '[appLineChart]'
})
export class LineChartDirective implements OnInit {

  @Input('appLineChart') obsData: Observable<ChartStackedType[]>
  @Input() width: number = 600
  @Input() height: number = 360
  margin = { top: 30, right: 80, bottom: 30, left: 30 }

  data: ChartStackedType[]

  host: d3.Selection<HTMLElement, unknown, null, undefined>
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  g: d3.Selection<SVGGElement, unknown, null, undefined>
  tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>

  // グラフ描画用サイズ
  gWidth: number
  gHeight: number

  // x軸
  xScale: d3.ScaleLinear<number, number>
  // y軸
  yScale: d3.ScaleLinear<number, number>
  // ライン計算
  line: d3.Line<any>
  // カラーリング
  lineColor = d3.scaleOrdinal(d3.schemePastel1)

  // ライン描画プロパティ名
  propNames: string[]
  // y軸目盛用最大値
  max: number

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
   * @memberof LineChartDirective
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
   * @memberof LineChartDirective
   */
  private setup() {
    // データオブジェクトとプロパティ名を取得
    const objects = this.data.map(temp => temp.obj)
    this.propNames = Object.getOwnPropertyNames(objects[0])

    // legend用マージン設定
    const length = this.propNames.map(name => name.length).reduce((a, b) => a > b ? a : b)
    if(length * 7 + 35 > this.margin.right) this.margin.right = length * 7 + 35

    // グラフ描画用サイズ
    this.gWidth = this.width - (this.margin.left + this.margin.right)
    this.gHeight = this.height - (this.margin.top + this.margin.bottom)

    // y軸目盛り用最大値
    this.max = this.propNames.map(prop => objects.map(obj => obj[prop]))
    .map(datum => d3.max(datum))
    .reduce((a, b) => a > b ? a : b)
    // x軸計算式設定
    this.xScale = d3.scaleLinear()
    .range([ 0, this.gWidth ])
    .domain([ 0, this.data.length - 1 ])
    // y軸計算式設定
    this.yScale = d3.scaleLinear()
    .range([ this.gHeight, 0 ])
    .domain([ 0, this.max ])
    
    // ライン描画用計算式設定
    this.line = d3.line<any>()
    .x((d, i) => this.xScale(i))
    .y((d, i) => this.yScale(d))
  }

  /**
   * 描画
   *
   * @private
   * @memberof LineChartDirective
   */
  private draw() {
    // グラフ描画用グループ追加
    this.g = this.svg.append('g')
    .attr('width', this.gWidth)
    .attr('height', this.gHeight)
    .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)

    // x軸ラベル描画、グリッド描画
    this.g.append('g')
    .attr('tramsform', `translate(0, ${this.height})`)
    .call(d3.axisBottom(this.xScale)
      .tickSize(this.gHeight)
      .ticks(this.data.length)
      .tickFormat((d, i) => {
        return this.data[i].name
      })
    ).selectAll('line')
    .attr('stroke', '#B0B0B0')
    // y軸ラベル描画、グリッド描画
    this.g.append('g')
    .attr('tramsform', `translate(0, 0)`)
    .call(d3.axisLeft(this.yScale)
      .tickSize(- this.gWidth)
      .ticks(this.max / 5)
      .tickFormat(null)
    ).selectAll('line')
    .attr('stroke', '#B0B0B0')

    // ライン描画
    this.propNames.forEach(prop => this.drawLine(prop))

    // 凡例描画
    this.drawLegend()
  }

  /**
   * ライン描画
   *
   * @private
   * @param {string} prop
   * @memberof LineChartDirective
   */
  private drawLine(prop: string) {
    // 該当オブジェクト取得
    const lineObj = this.data.map(datum => {
      return {
        name: datum.name,
        value: datum.obj[prop]
      }
    })
    // データのみに変換
    const lineData = lineObj.map(obj => obj.value)
    // プロパティのインデックス取得
    const index = this.propNames.indexOf(prop)
    // パス描画
    let path = this.g.append('path')
    .attr('stroke-width', '3')
    .attr('stroke', this.lineColor(index.toString()))
    .attr('fill', 'none')
    .attr('d', this.line(lineData))

    // アニメーションようにパスの長さを取得
    const pathLength = path.node().getTotalLength()
    // アニメーション表示
    path.attr('stroke-dasharray', `${pathLength} ${pathLength}`)
    .attr('stroke-dashoffset', pathLength)
    .transition()
    .duration(800)
    .ease(d3.easeLinear)
    .attr('stroke-dashoffset', '0')

    // ポイント描画
    this.g.selectAll(`.c${index}`)
    .data(lineData)
    .enter()
    .append('circle')
    .attr('cx', this.line.x())
    .attr('cy', this.line.y())
    .attr('r', 5)
    .attr('fill', this.lineColor(index.toString()))
    .attr('opacity', 0)
    .attr('class', `c${index}`)
    .on('mouseenter', (d, i, n) => {
      const x = n[i].getBoundingClientRect().left
      const y = n[i].getBoundingClientRect().top + window.scrollY
      this.tooltip
      .style('visibility', 'visible')
      .style('left', x + 'px')
      .style('top', y + 'px')
      .html(prop + '<br>' + lineObj[i].name + ' : ' + lineObj[i].value)
      .on('mouseenter', () => this.tooltip.style('visibility', 'visible'))
      .on('mouseleave', () => this.tooltip.style('visibility', 'hidden'))
    })
    .on('mouseleave', () => this.tooltip.style('visibility', 'hidden'))
    // アニメーション
    .transition()
    .delay((d, i) => 800 / lineObj.length * i)
    .attr('opacity', 1)
  }

  /**
   * 凡例描画
   *
   * @private
   * @memberof LineChartDirective
   */
  private drawLegend() {
    // legend描画グループ追加
    let legend = this.svg.append('g')
    .selectAll('line')
    .data(this.propNames)

    // ライン描画
    legend.enter()
    .append('line')
    .attr('x1', this.margin.left + this.gWidth)
    .attr('y1', this.margin.top)
    .attr('x2', this.margin.left + this.gWidth + 20)
    .attr('y2', this.margin.top)
    .attr('transform', (d, i, n) => `translate(10, ${i * 20})`)
    .attr('stroke', (d, i, n) => this.lineColor(i.toString()))
    .attr('stroke-width', '3')

    // ラベル描画
    legend.enter()
    .append('text')
    .attr('x', this.margin.left + this.gWidth + 25)
    .attr('y', this.margin.top + 3)
    .attr('transform', (d, i, n) => `translate(10, ${i * 20})`)
    .style('font-size', 12)
    .text(text => text)
  }

  /**
   * グラフ描画グループ削除
   *
   * @private
   * @memberof LineChartDirective
   */
  private remove() {
    this.svg.selectAll('g').remove()
  }

}
