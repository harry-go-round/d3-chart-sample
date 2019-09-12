import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { BarChartDirective } from './directive/bar-chart.directive';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { PieChartDirective } from './directive/pie-chart.directive';
import { StackedBarChartComponent } from './stacked-bar-chart/stacked-bar-chart.component';
import { StackedBarChartDirective } from './directive/stacked-bar-chart.directive';
import { LineChartComponent } from './line-chart/line-chart.component';
import { LineChartDirective } from './directive/line-chart.directive';
import { ScatterPlotComponent } from './scatter-plot/scatter-plot.component';
import { ScatterPlotDirective } from './directive/scatter-plot.directive';

@NgModule({
  declarations: [
    AppComponent,
    BarChartComponent,
    BarChartDirective,
    PieChartComponent,
    PieChartDirective,
    StackedBarChartComponent,
    StackedBarChartDirective,
    LineChartComponent,
    LineChartDirective,
    ScatterPlotComponent,
    ScatterPlotDirective
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
