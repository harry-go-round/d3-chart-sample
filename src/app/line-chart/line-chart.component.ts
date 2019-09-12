import { Component, OnInit } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ChartStackedType } from '../interface/chart-stacked-type';

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
    obj: { property1: 10, property2: 40, property3: 30 }
  },
  {
    name: 'ddd',
    obj: { property1: 60, property2: 20, property3: 10 }
  },
  {
    name: 'eee',
    obj: { property1: 20, property2: 60, property3: 40 }
  },
  {
    name: 'fff',
    obj: { property1: 45, property2: 25, property3: 10 }
  },
  {
    name: 'ggg',
    obj: { property1: 30, property2: 55, property3: 20 }
  },
]

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements OnInit {

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
