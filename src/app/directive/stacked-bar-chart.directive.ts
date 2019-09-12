import { Directive, OnInit, Input, ElementRef } from '@angular/core';
import * as d3 from "d3";
import { Observable } from 'rxjs';
import { ChartStackedType } from '../interface/chart-stacked-type';

@Directive({
  selector: '[appStackedBarChart]'
})
export class StackedBarChartDirective implements OnInit {

  @Input('appStackedBarChart') obsData: Observable<[]>
  @Input() width: number = 600
  @Input() height: number = 360
  margin = { top: 30, right: 30, bottom: 30, left: 30 }

  data: ChartStackedType[]
  names: string[]
  series: d3.Series<any, string>[]
  propNames: string[]
  
  host: d3.Selection<HTMLElement, unknown, null, undefined>
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  g: d3.Selection<SVGGElement, unknown, null, undefined>
  tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>

  // カラーリング
  rectColor = d3.scaleOrdinal(d3.schemePastel1)

  // グラフ描画エリア
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
   * @memberof StackedBarChartDirective
   */
  private setup() {
    // データオブジェクトとプロパティ名を取得
    this.names = this.data.map(temp => temp.name)
    const objects = this.data.map(temp => temp.obj)
    this.propNames = Object.getOwnPropertyNames(objects[0])

    // legend用マージン設定
    const length = this.propNames.map(name => name.length).reduce((a, b) => a > b ? a : b)
    if(length * 7 + 35 > this.margin.right) this.margin.right = length * 7 + 35

    // グラフ描画用サイズ
    this.gWidth = this.width - (this.margin.left + this.margin.right)
    this.gHeight = this.height - (this.margin.top + this.margin.bottom)

    // objectのプロパティ名取得
    const propNames = Object.getOwnPropertyNames(objects[0])
    // 積み上げ計算式
    const stack = d3.stack<any>().keys(propNames)
      
    // 積み上げ用データに変換
    this.series = stack(objects)

    // x軸計算式
    this.xScale = d3.scaleBand()
    .range([ 0, this.gWidth ])
    .domain(this.names)
    .padding(0.2)

    // y軸目盛り用最大値
    let max = objects.map(object => {
      let sum = 0
      propNames.forEach(prop => {
        sum = object[prop] + sum
      })
      return sum
    }).reduce((a, b) => a > b ? a : b, 0)
    // y軸計算式
    this.yScale = d3.scaleLinear()
    .range([ this.gHeight, 0 ])
    .domain([ 0, max ])
  }

  /**
   * 描画
   *
   * @private
   * @memberof StackedBarChartDirective
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

    // x軸ごと描画用グループ追加
    let col = this.g.append('g')
    .selectAll('g')
    .data(this.series)
    .enter()
    .append('g')
    .attr('fill', (d, i, n) => this.rectColor(i.toString()))
    .attr('opacity', '0.9')
    // .attr('stroke', '#FFFFFF')

    // データ描画追加
    col.selectAll('rect')
    .data((d, i, n) => d)
    .enter()
    .append('rect')
    .attr('x', (d, i, n) => this.xScale(this.names[i]))
    .attr('y', this.height)
    .attr('width', this.xScale.bandwidth())
    // tooltip表示
    .on('mouseenter', (d, i, n) => {
      const x = n[i].getBoundingClientRect().left
      const y = n[i].getBoundingClientRect().top + window.scrollY
      const val = Math.round((d[1] - d[0]) * 10) / 10
      const name = d3.select<any, any>(n[i].parentNode).datum().key
      this.tooltip
      .style('visibility', 'visible')
      .style('left', x + 'px')
      .style('top', y + 'px')
      .html(name + '<br>' + val + '%')
      .on('mouseover', () => this.tooltip.style('visibility', 'visible'))
      .on('mouseleave', () => this.tooltip.style('visibility', 'hidden'))
    })
    .on('mouseleave', () => this.tooltip.style('visibility', 'hidden'))
    // アニメーション表示
    .transition()
    .duration(500)
    .ease(d3.easeLinear)
    // .delay((d, i, n) => i * 200)
    .attr('y', (d, i, n) => this.yScale(d[1]))
    .attr('height', (d, i, n) => this.yScale(d[0]) - this.yScale(d[1]))

    // 凡例描画
    this.drawLegend()
  }

  /**
   * 凡例描画
   *
   * @private
   * @memberof StackedBarChartDirective
   */
  private drawLegend() {
    // legend描画グループ追加
    let legend = this.svg.append('g')
    .selectAll('rect')
    .data(this.propNames)

    // ライン描画
    legend.enter()
    .append('rect')
    .attr('x', this.margin.left + this.gWidth)
    .attr('y', this.margin.top)
    .attr('width', 10)
    .attr('height', 10)
    .attr('transform', (d, i, n) => `translate(10, ${i * 20})`)
    .attr('fill', (d, i, n) => this.rectColor(i.toString()))

    // ラベル描画
    legend.enter()
    .append('text')
    .attr('x', this.margin.left + this.gWidth + 15)
    .attr('y', this.margin.top + 7)
    .attr('transform', (d, i, n) => `translate(10, ${i * 20})`)
    .style('font-size', 12)
    .text(text => text)
  }

  /**
   * グラフ描画グループ削除
   *
   * @private
   * @memberof StackedBarChartDirective
   */
  private remove() {
    this.svg.selectAll('g').remove()
  }

}
