import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ChartBasicType } from '../interface/chart-basic-type';
import { Subject, Observable } from 'rxjs';

const data: ChartBasicType[] = [
  { name: 'aaa', value: 5},
  { name: 'bbb', value: 4},
  { name: 'ccc', value: 3},
  { name: 'ddd', value: 2},
  { name: 'eee', value: 1}
]

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent implements OnInit, AfterViewInit {

  sub: Subject<ChartBasicType[]> = new Subject()
  obsData: Observable<ChartBasicType[]> = this.sub.asObservable()
  data: ChartBasicType[]

  constructor() { }

  ngOnInit() {
    this.data = data
  }

  ngAfterViewInit() {
    setTimeout(() => this.sub.next(data))
  }

  change(d: { name: string, value: number }, e) {
    d.value = +e.target.value
    this.sub.next(this.data)
  }
}
