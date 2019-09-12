import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ChartStackedType } from '../interface/chart-stacked-type';
import { Subject, Observable } from 'rxjs';

const data: ChartStackedType[] = [
  {
    name: 'aaa',
    obj: { property1: 50, property2: 20, property3: 30 }
  },
  {
    name: 'bbb',
    obj: { property1: 40, property2: 20, property3: 30 }
  },
  {
    name: 'ccc',
    obj: { property1: 30, property2: 30, property3: 30 }
  },
  {
    name: 'ddd',
    obj: { property1: 60, property2: 20, property3: 10 }
  },
  {
    name: 'eee',
    obj: { property1: 20, property2: 60, property3: 40 }
  },
]

@Component({
  selector: 'app-stacked-bar-chart',
  templateUrl: './stacked-bar-chart.component.html',
  styleUrls: ['./stacked-bar-chart.component.css']
})
export class StackedBarChartComponent implements OnInit, AfterViewInit {

  sub: Subject<ChartStackedType[]> = new Subject()
  obsData: Observable<ChartStackedType[]> = this.sub.asObservable()
  data: ChartStackedType[]
  props: string[]

  constructor() { }

  ngOnInit() {
    this.data = data
    this.props = Object.getOwnPropertyNames(this.data.map(temp => temp.obj)[0])
  }

  ngAfterViewInit() {
    setTimeout(() => this.sub.next(this.data))
  }

  change(datum: ChartStackedType, prop: string, e) {
    datum.obj[prop] = +e.target.value
    this.sub.next(this.data)
  }
}
