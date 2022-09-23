import { Component, Host, State, h } from '@stencil/core';
import { fetchTranslations } from '../../../utils/translation'
import resources from '../../../resources'
import { tooltip } from '../../../utils/tooltip';

const counter = (val) => {
  if (val < 10) {
    return {agg: [val, 10 - val], total: 12}
  } else if (val < 100) {
    return {agg: [val, 100 - val], total: 120}
  } else if (val < 1000) {
    return {agg: [val, 1000 - val], total: 1200}
  } else if (val < 10000) {
    return {agg: [val, 10000 - val], total: 12000}
  }
}

@Component({
  tag: 'page-dashboard',
  styleUrl: 'page-dashboard.css',
  shadow: true,
})
export class PageDashboard {

  i18n: any = {
    stats: {
      views_origins: 'Views by origin',
      views_browsers: 'Views by browsers',
      views_langs: 'Views by language',
      views_hosts: 'Views by hosts'
    }
  };

  origins = ['natusfera', 'plantnet', 'gbif']

  @State() segment = 'general'

  @State() commentsAgg: any
  @State() downloadsAgg: any
  @State() usersAgg: any
  @State() charts: any = {}
  @State() periodComments: string = 'p1Y'
  @State() periodDownloads: string = 'p1Y'
  @State() periodUsers: string = 'p1Y'

  chartRef: HTMLElement
  svg: HTMLElement

  async componentWillLoad() {
    this.i18n = await fetchTranslations(this.i18n)
  }
  async componentDidLoad() {
    this.agg()
  }

  agg() {
    fetch(resources.host + '/agg')
    .then(res => res.json())
    .then(res => {
      const call1 = (res) => {
        this.commentsAgg = res
        this.setPeriodComments(this.periodComments)
        this.setPie({
          el: this.charts.origins,
          agg: res.origins
        })
        this.setChartCounter({
          el: this.charts.commentsCountEl,
          count: (res.comments_count || 0) + (res.identifications_count || 0),
          title: `Comments &<br> Identifications`
        })
      }
      const call2 = (res) => {
        this.downloadsAgg = res
        this.setChartCounter({
          el: this.charts.identificationsCountEl,
          count: res.downloads_count,
          title: 'Downloads'
        })
        this.setPeriodDownloads(this.periodDownloads)
        this.setPie({
          el: this.charts.reasons,
          agg: res.reasons
        })
      }
      const call3 = (res) => {
        this.usersAgg = res
        this.setPeriodUsers(this.periodUsers)
        this.setPie({
          el: this.charts.professions,
          agg: res.professions
        })
        this.setChartCounter({el: this.charts.usersCountEl, count: res.users_count || 0, title: 'Users'})
      }
      setTimeout(() => {
        call1(res.comments)
        call2(res.downloads)
        call3(res.users)
      }, 250)
    })
  }

  loadSvg(el: HTMLElement) {
    let q = ''

    if (this.userId) {
      if (!q) q = '?'
      q += `ref_user=${this.userId}&`
    }
    if (this.origin) {
      if (!q) q = '?'
      q += `origin=${this.origin}&`
    }

    this.svg = el
    fetch(resources.host + '/logs/all.svg' + q)
    .then(res => res.text())
    .then(res => {
      this.svg.innerHTML = res
      this.svg.firstElementChild.classList.add('chart-svg')
      tooltip(this.svg)
    })

    fetch(resources.host + '/logs/agg' + q)
    .then(res => res.json())
    .then(res => {
      const origins = ['natusfera', 'gbif', 'plantnet']
      this.setPie({
        el: this.charts.views_origins,
        agg: res.origins.filter(i => origins.includes(i._id))
      })

      this.setPie({
        el: this.charts.views_browsers,
        agg: res.browser
      })

      const langs = {}

      res.lang.map(lang => {
        const _id = (lang._id || '').toUpperCase().split('-')[0]
        langs[_id] = langs[_id] || { _id }
        langs[_id].count = langs[_id].count || 0
        langs[_id].count += lang.count
      })
      this.setPie({
        el: this.charts.views_langs,
        agg: Object.values(langs)
      })

      this.setPie({
        el: this.charts.views_hosts,
        agg: res.hosts
      })
    })

  }

  setPeriodComments(p) {
    this.periodComments = p

    const periods = {
      p1Y: {
        el: this.charts.comments12M,
        agg: [
          Object.values(this.commentsAgg.last12M.comments),
          Object.values(this.commentsAgg.last12M.identifications)
        ],
        labels: Object.keys(this.commentsAgg.last12M.comments),
        legends: [this.i18n.profile.comments, this.i18n.profile.identifications]
      },
      p1M: {
        el: this.charts.comments12M,
        agg: [
          Object.values(this.commentsAgg.last30d.comments),
          Object.values(this.commentsAgg.last30d.identifications)
        ],
        labels: Object.keys(this.commentsAgg.last30d.comments).map((key, i) => {
          return i % 2 ? key : ''
        }),
        legends: [this.i18n.profile.comments, this.i18n.profile.identifications]
      }
    }
    this.setBar(periods[this.periodComments] || periods.p1Y)
  }

  setPeriodDownloads(p) {
    this.periodDownloads = p

    const periods = {
      p1Y: {
        el: this.charts.downloads12M,
        agg: [Object.values(this.downloadsAgg.last12M)],
        labels: Object.keys(this.downloadsAgg.last12M)
      },
      p1M: {
        el: this.charts.downloads12M,
        agg: [Object.values(this.downloadsAgg.last30d)],
        labels: Object.keys(this.downloadsAgg.last30d).map((key, i) => {
          return i % 2 ? key : ''
        })
      }
    }

    this.setBar(periods[this.periodDownloads] || periods.p1Y)
  }

  setPeriodUsers(p) {
    this.periodUsers = p

    const periods = {
      p1Y: {
        el: this.charts.users12M,
        agg: [Object.values(this.usersAgg.last12M)],
        labels: Object.keys(this.usersAgg.last12M)
      },
      p1M: {
        el: this.charts.users12M,
        agg: [Object.values(this.usersAgg.last30d)],
        labels: Object.keys(this.usersAgg.last30d).map((key, i) => {
          return i % 2 ? key : ''
        })
      }
    }

    this.setBar(periods[this.periodUsers] || periods.p1Y)
  }

  async setPie({el, agg}) {
    const Chartist = await import('chartist')
    const ChartistPluginLegend = (await import('chartist-plugin-legend')).default
    const total = agg.map(i => i.count).reduce((a, b) => b + a, 0)
    new Chartist.Pie(el, {
      labels: agg.map(_ => _.count),
      series: agg.map(i => i.count)
    }, {
      donut: false,
      donutWidth: 60,
      donutSolid: true,
      startAngle: 270,
      showLabel: true,
      plugins: [
        ChartistPluginLegend({
          legendNames: agg.map(i => (i._id || 'Other'))
        })
      ],
      labelInterpolationFnc: function(value) {
        return Math.round(value / total * 100) + '%';
      }
    });
  }

  async setBar({el, agg, labels, legends}) {
    const Chartist = await import('chartist')
    const ChartistPluginLegend = (await import('chartist-plugin-legend')).default

    new Chartist.Bar(el, {
      labels,
      series: agg
    }, {
      seriesBarDistance: 10,
      axisY: {
        onlyInteger: true,
        offset: 20
      },
      plugins: legends ? [
        ChartistPluginLegend({
          legendNames: legends
        })
      ] : null
    }, [
      ['screen and (max-width: 640px)', {
        seriesBarDistance: 5,
        axisX: {
          labelInterpolationFnc: function (value) {
            return value[0];
          }
        }
      }]
    ]).on('draw', (data) => {
      if (data.type === 'bar') {
        data.element.attr({
          style: 'stroke-width: 10px'
        });
      }
    });
  }

  async setChartCounter({ el, count, title }) {
    const Chartist = await import('chartist')
    const ChartistPluginFillDonut = (await import('chartist-plugin-fill-donut')).default

    const { agg, total } = counter(count)

    const chart = new Chartist.Pie(el, {
        series: agg,
        labels: ['', '']
      }, {
        donut: true,
        donutWidth: 20,
        startAngle: 210,
        total: total,
        showLabel: false,
        plugins: [
          ChartistPluginFillDonut({
            items: [{
              content: '<ion-icon name="speedometer"></ion-icon>',
              position: 'bottom',
              offsetY : 10,
              offsetX: -8,
              fontSize: '20px'
            }, {
              position: 'center',
              offsetY : -10,
              content: `<h3><span class="small">${count} <br>${title}</span></h3>`
            }]
          })
        ]
      });

    chart.on('draw', function(data) {
      if (data.type === 'slice' && data.index == 0) {
        // Get the total path length in order to use for dash array animation
        const pathLength = data.element._node.getTotalLength();

        // Set a dasharray that matches the path length as prerequisite to animate dashoffset
        data.element.attr({
          'stroke-dasharray': pathLength + 'px ' + pathLength + 'px'
        });

        // Create animation definition while also assigning an ID to the animation for later sync usage
        const animationDefinition = {
          'stroke-dashoffset': {
            id: 'anim' + data.index,
            dur: 1200,
            from: -pathLength + 'px',
            to:  '0px',
            easing: Chartist.Svg.Easing.easeOutQuint,
            fill: 'freeze'
          }
        };

        // We need to set an initial value before the animation starts as we are not in guided mode which would do that for us
        data.element.attr({
          'stroke-dashoffset': -pathLength + 'px'
        });

        // We can't use guided mode as the animations need to rely on setting begin manually
        // See http://gionkunz.github.io/chartist-js/api-documentation.html#chartistsvg-function-animate
        data.element.animate(animationDefinition, true);
      }
    });
  }

  segmentChanged(ev) {
    this.segment = ev.detail.value
    console.log({ev})
  }

  origin: string = null
  onOriginChange(ev) {
    this.origin = ev.detail.value
    this.loadSvg(this.svg)
  }

  userId: number = null
  onUserChange(ev) {
    this.userId = ev.detail.value
    this.loadSvg(this.svg)
  }

  render() {
    return (
      <Host>
        <div class="dashboard-container">
          <ion-title><h2>Dashboard</h2></ion-title>

          <ion-segment value={this.segment} onIonChange={ev => this.segmentChanged(ev)}>
            <ion-segment-button value="general">
              <ion-label>General</ion-label>
            </ion-segment-button>
            <ion-segment-button value="views">
              <ion-label>Views</ion-label>
            </ion-segment-button>
          </ion-segment>

          <div class={{segment: true, visible: this.segment === 'general'}}>

            <span ref={(el) => this.charts.commentsCountEl = (el as HTMLElement)} class="ct-chart ct-chart-counter"></span>
            <span ref={(el) => this.charts.identificationsCountEl = (el as HTMLElement)} class="ct-chart ct-chart-counter"></span>
            <span ref={(el) => this.charts.usersCountEl = (el as HTMLElement)} class="ct-chart ct-chart-counter"></span>

            <div class="charts">

              <div class="cnt-header-chart">
                <ion-title class="title-chart"><b>{this.i18n.stats.comments_identi}</b></ion-title>
              </div>
              <div class="cnt-header-chart">
                <ul class="period">
                  <li onClick={() => this.setPeriodComments('p1M')} class={'p1M' === this.periodComments ? 'active' : ''}>1M</li>
                  <li onClick={() => this.setPeriodComments('p1Y')} class={'p1Y' === this.periodComments ? 'active' : ''}>1Y</li>
                  <li onClick={() => this.setPeriodComments('pAll')} class={'pAll' === this.periodComments ? 'active' : ''}>ALL</li>
                </ul>
              </div>
              <span ref={(el) => this.charts.comments12M = (el as HTMLElement)} class="ct-chart ct-style-one chart-bar mb-100"></span>

              <div class="cnt-header-chart">
                <ion-title class="title-chart"><b>{this.i18n.stats.comm_id_by_portal}</b></ion-title>
              </div>
              <span ref={(el) => this.charts.origins = (el as HTMLElement)} class="ct-chart ct-style-one"></span>
            </div>

            <div class="charts">
              <div class="cnt-header-chart">
                <ion-title class="title-chart"><b>{this.i18n.stats.downloads}</b></ion-title>
              </div>

              <div class="cnt-header-chart">
                <ul class="period">
                  <li onClick={() => this.setPeriodDownloads('p1M')} class={'p1M' === this.periodDownloads ? 'active' : ''}>1M</li>
                  <li onClick={() => this.setPeriodDownloads('p1Y')} class={'p1Y' === this.periodDownloads ? 'active' : ''}>1Y</li>
                  <li onClick={() => this.setPeriodDownloads('pAll')} class={'pAll' === this.periodDownloads ? 'active' : ''}>ALL</li>
                </ul>
              </div>
              <span ref={(el) => this.charts.downloads12M = (el as HTMLElement)} class="ct-chart ct-style-one chart-bar mb-100"></span>
              

              <div class="cnt-header-chart">
                <ion-title class="title-chart"><b>{this.i18n.stats.downloads_reasons}</b></ion-title>
              </div>
              <span ref={(el) => this.charts.reasons = (el as HTMLElement)} class="ct-chart ct-style-one"></span>

            </div>

            <div class="charts">
              <div class="cnt-header-chart">
                <ion-title class="title-chart"><b>Users</b></ion-title>
              </div>

              <div class="cnt-header-chart">
                <ul class="period">
                  <li onClick={() => this.setPeriodUsers('p1M')} class={'p1M' === this.periodUsers ? 'active' : ''}>1M</li>
                  <li onClick={() => this.setPeriodUsers('p1Y')} class={'p1Y' === this.periodUsers ? 'active' : ''}>1Y</li>
                  <li onClick={() => this.setPeriodUsers('pAll')} class={'pAll' === this.periodUsers ? 'active' : ''}>ALL</li>
                </ul>
              </div>
              <span ref={(el) => this.charts.users12M = (el as HTMLElement)} class="ct-chart ct-style-one chart-bar mb-100"></span>
              

              <div class="cnt-header-chart">
                <ion-title class="title-chart"><b>Professions</b></ion-title>
              </div>
              <span ref={(el) => this.charts.professions = (el as HTMLElement)} class="ct-chart ct-style-one"></span>
            </div>
          </div>

          <div class={{segment: true, visible: this.segment === 'views'}}>
            <ion-item lines="none" tabIndex="-1" className="center row-filters">
              <ion-select onIonChange={ev => this.onOriginChange(ev)} placeholder={this.i18n.filters.portals}>
                <ion-select-option value={null}>- All</ion-select-option>
                {this.origins.map(origin =>
                  <ion-select-option value={origin}>{origin}</ion-select-option>
                )}
              </ion-select>

              <ion-input class="user-input" onIonChange={ev => this.onUserChange(ev)} placeholder="user id"/>
            </ion-item>

            <div class="charts">
              <div class="cnt-header-chart">
                <ion-title class="title-chart"><b>Views by country</b></ion-title>
              </div>
              <span ref={el => this.loadSvg(el as HTMLElement)} class="ct-chart-svg">
              </span>

              <div class="cnt-header-chart">
                <ion-title class="title-chart"><b>{this.i18n.stats.views_origins}</b></ion-title>
              </div>
              <span ref={(el) => this.charts.views_origins = (el as HTMLElement)} class="ct-chart ct-style-one"></span>

              <div class="cnt-header-chart">
                <ion-title class="title-chart"><b>{this.i18n.stats.views_browsers}</b></ion-title>
              </div>
              <span ref={(el) => this.charts.views_browsers = (el as HTMLElement)} class="ct-chart ct-style-one"></span>

              <div class="cnt-header-chart">
                <ion-title class="title-chart"><b>{this.i18n.stats.views_langs}</b></ion-title>
              </div>
              <span ref={(el) => this.charts.views_langs = (el as HTMLElement)} class="ct-chart ct-style-one"></span>

              <div class="cnt-header-chart">
                <ion-title class="title-chart"><b>{this.i18n.stats.views_hosts}</b></ion-title>
              </div>
              <span ref={(el) => this.charts.views_hosts = (el as HTMLElement)} class="ct-chart ct-style-one last-chart"></span>

            </div>
          </div>
        </div>
      </Host>
    );
  }

}
