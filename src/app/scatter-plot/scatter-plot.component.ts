import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ScatterPlotType } from '../interface/scatter-plot-type';

const data: ScatterPlotType[] = [
  {
    name: 'aaaa',
    values: [
      { x: 15, y: 20 },
      { x: 18, y: 7 },
      { x: 22, y: 26 },
      { x: 8, y: 17 },
      { x: 12, y: 8 },
      { x: 24, y: 14 },
      { x: 4, y: 3 },
      { x: 28, y: 25 }
    ]
  },
  {
    name: 'bbbb',
    values: [
      { x: 1, y: 28 },
      { x: 10, y: 18 },
      { x: 6, y: 20 },
      { x: 26, y: 6 },
      { x: 14, y: 15 },
      { x: 21, y: 12 },
      { x: 9, y: 11 },
      { x: 17, y: 16 }
    ]
  }
]

@Component({
  selector: 'app-scatter-plot',
  templateUrl: './scatter-plot.component.html',
  styleUrls: ['./scatter-plot.component.css']
})
export class ScatterPlotComponent implements OnInit, AfterViewInit {

  sub: Subject<ScatterPlotType[]> = new Subject()
  obsData: Observable<ScatterPlotType[]> = this.sub.asObservable()
  data: ScatterPlotType[]
  props: string[] = [ 'x', 'y' ]

  constructor() { }

  ngOnInit() {
    this.data = data
  }

  ngAfterViewInit() {
    setTimeout(() => this.sub.next(this.data))
  }

  change(datum: {x: number, y: number }, prop: string, e) {
    datum[prop] = +e.target.value
    this.sub.next(this.data)
  }
}
