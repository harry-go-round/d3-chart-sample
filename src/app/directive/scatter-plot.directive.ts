import { Directive, OnInit, Input, ElementRef } from '@angular/core';
import * as d3 from "d3";
import { Observable } from 'rxjs';
import { ScatterPlotType } from '../interface/scatter-plot-type';

@Directive({
  selector: '[appScatterPlot]'
})
export class ScatterPlotDirective implements OnInit {

  @Input('appScatterPlot') obsData: Observable<ScatterPlotType[]>
  @Input() width: number = 600
  @Input() height: number = 360
  margin = { top: 30, right: 80, bottom: 30, left: 30 }

  data: ScatterPlotType[]

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

  // x軸目盛用最大値
  xMax: number
  // y軸目盛用最大値
  yMax: number

  // カラーリング
  plotColor = d3.scaleOrdinal(d3.schemePastel1)

  // データ名称
  names: string[]
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
   * @memberof ScatterPlotDirective
   */
  private addTooltip() {
    this.tooltip = this.host.append('div')
    .style('visibility', 'hidden')
    .style('position', 'absolute')
    .style('top', 0)
    .style('left', 0)
    .style('width', 80 + 'px')
    .style('height', 42 + 'px')
    .style('background-color', '#AAAAAA')
    .style('border-radius', 5 + 'px')
    .style('opacity', '0.9')
    .style('box-shadow', '4px 4px 6px 2px rgba(0, 0, 0, 0.9')
    .style('color', '#FFFFFF')
    .style('font-size', 14 + 'px')
    .style('text-align', 'center')
    .style('display', 'table-cell')
    .style('vertical-align', 'middle')
    .style('z-index', '999')
  }

  private setup() {
    // データ名称
    this.names = this.data.map(temp => temp.name)
    const values = this.data.map(temp => temp.values)

    // legend用マージン設定
    const length = this.names.map(name => name.length).reduce((a, b) => a > b ? a : b)
    if(length * 7 + 35 > this.margin.right) this.margin.right = length * 7 + 35

    // グラフ描画用サイズ
    this.gWidth = this.width - (this.margin.left + this.margin.right)
    this.gHeight = this.height - (this.margin.top + this.margin.bottom)

    // xy軸最大値
    this.xMax = d3.max(values.map(value => value.map(val => val.x).reduce((a, b) => a > b ? a : b)))
    this.yMax = d3.max(values.map(value => value.map(val => val.y).reduce((a, b) => a > b ? a : b)))

    // x軸計算式設定
    this.xScale = d3.scaleLinear()
    .range([ 0, this.gWidth ])
    .domain([ 0, this.xMax ])
    // y軸計算式設定
    this.yScale = d3.scaleLinear()
    .range([ this.gHeight, 0 ])
    .domain([ 0, this.yMax ])
  }

  /**
   * 描画
   *
   * @private
   * @memberof ScatterPlotDirective
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
      .tickFormat(null)
    ).selectAll('line')
    .attr('stroke', '#B0B0B0')
    // y軸ラベル描画、グリッド描画
    this.g.append('g')
    .attr('tramsform', `translate(0, 0)`)
    .call(d3.axisLeft(this.yScale)
      .tickSize(- this.gWidth)
      .tickFormat(null)
    ).selectAll('line')
    .attr('stroke', '#B0B0B0')

    // プロット描画
    this.names.forEach(name => this.drawPlot(name))

    // 凡例描画
    this.drawLegend()
  }

  /**
   * プロット描画
   *
   * @private
   * @param {string} name
   * @memberof ScatterPlotDirective
   */
  private drawPlot(name: string) {
    const index = this.names.indexOf(name)
    const dataValue = this.data.find(datum => datum.name == name).values

    let circle = this.g.selectAll(`.c${index}`)
    .data(dataValue)
    .enter()
    .append('circle')
    .attr('cx', (d, i, n) => this.xScale(d.x))
    .attr('cy', (d, i, n) => this.yScale(d.y))
    .attr('r', 5)
    .attr('fill', (d, i, n) => this.plotColor(index.toString()))
    .attr('class', `c${index}`)
    .on('mouseenter', (d, i, n) => {
      const x = n[i].getBoundingClientRect().left
      const y = n[i].getBoundingClientRect().top + window.scrollY
      this.tooltip
      .style('visibility', 'visible')
      .style('left', x + 'px')
      .style('top', y + 'px')
      .html(name + '<br>x:' + d.x + ', y:' + d.y)
      .on('mouseenter', () => this.tooltip.style('visibility', 'visible'))
      .on('mouseleave', () => this.tooltip.style('visibility', 'hidden'))
    })
    .on('mouseleave', () => this.tooltip.style('visibility', 'hidden'))
  }

  private drawLegend() {
    // legend描画グループ追加
    let legend = this.svg.append('g')
    .selectAll('circle')
    .data(this.names)

    // circle描画
    legend.enter()
    .append('circle')
    .attr('cx', this.margin.left + this.gWidth + 10)
    .attr('cy', this.margin.top)
    .attr('r', 5)
    .attr('transform', (d, i, n) => `translate(10, ${i * 20})`)
    .attr('fill', (d, i, n) => this.plotColor(i.toString()))

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
   * @memberof ScatterPlotDirective
   */
  private remove() {
    this.svg.selectAll('g').remove()
  }

}
