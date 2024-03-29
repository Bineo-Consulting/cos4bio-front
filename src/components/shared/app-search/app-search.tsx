import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';
import { GbifService } from '../../../services/gbif.service';
import { PlacesService } from '../../../services/places.service';
import { fetchTranslations } from '../../../utils/translation';

@Component({
  tag: 'app-search',
  styleUrl: 'app-search.css',
  shadow: true,
})
export class AppSearch {

  @Prop({mutable: true}) specie: string;
  @Prop({mutable: true}) place: string;
  @Prop() query: any;
  @Event() search: EventEmitter<any>;

  i18n: any = {};  
  title: {[key: string]: string} = {
    portal: null,
    type: null,
    quality: null,
    license: null
  }
  filters: { [key: string]: HTMLElement } = {};
  refs: { [key: string]: HTMLElement } = {};

  params: any = {}

  origin: any = {
    natusfera: 'false',
    plantnet: 'false',
    gbif: 'false',
    artportalen: 'false'
  }
  origins = Object.keys(this.origin) // hamelin

  iconic_taxa: any = {}
  types = [
    {key: 'plantae', value: 'plantae', label: '🌿 Plantae'},
    {key: 'arachnida', value: 'arachnida', label: '🕷 Arachnida'},
    {key: 'mollusca', value: 'mollusca', label: '🦑 Mollusca'},
    {key: 'insecta', value: 'insecta', label: '🐞 Insecta'},
    {key: 'amphibia', value: 'amphibia', label: '🐸 Amphibia'},
    {key: 'aves', value: 'aves', label: '🦆 Aves'},
    {key: 'mammalia', value: 'mammalia', label: '🦁 Mammalia'},
    {key: 'reptilia', value: 'reptilia', label: '🐍 Reptilia'},    
    {key: 'actinopterygii', value: 'actinopterygii', label: '🐠 Actinopterygii'},
    {key: 'animalia', value: 'animalia', label: '🐱 Animalia'},
    {key: 'fungi' ,value: 'fungi', label: '🍄 Fungi'}      
  ]

  quality: any = {
    research: 'false',
    casual: 'false',
    geo: 'false',
    photos: 'false'
  }
  qualities = [
    {key: 'research', value: 'research', label: '👨‍🔬 Research'},
    {key: 'casual', value: 'casual', label: '🤷‍♂️ Casual'},
    {key: 'geo', value: 'geo', label: '📍 Geo'},
    {key: 'photos', value: 'photos', label: '🖼 photos'}
  ]

  license = {
    'CC0': 'false',
    'CC BY': 'false',
    'CC BY-NC': 'false',
    'CC BY-SA': 'false',
  }
  licenses = [
    {key: 'none', value: 'none', label: 'CC0'},
    {key: 'CC-BY', value: 'CC-BY', label: 'CC-BY'},
    {key: 'CC-BY-NC', value: 'CC-BY-NC', label: 'CC-BY-NC'},
    {key: 'CC-BY-SA', value: 'CC-BY-SA', label: 'CC-BY-SA'},
  ]

  date = {
    minEventDate: null,
    maxEventDate: null
  }


  async componentWillLoad() {
    this.i18n = await fetchTranslations(this.i18n)

    if (this.query) {
      const origins = (this.query.origin || '').split(',')
      origins.map(item => {
        this.origin[item] = 'true'
      })
      this.origin = {...this.origin}

      const iconic_taxa = (this.query.iconic_taxa || '').split(',')
      iconic_taxa.map(item => {
        this.iconic_taxa[item] = 'true'
      })
      this.iconic_taxa = {...this.iconic_taxa}

      const quality_grade = (this.query.quality_grade || '').split(',')
      quality_grade.map(item => {
        this.quality[item] = 'true'
      })
      this.quality = {...this.quality}

      const licenses = (this.query.license || '').split(',')
      licenses.map(item => {
        this.license[item] = 'true'
      })
      this.license = {...this.license}

      this.date.minEventDate = this.query.minEventDate || null
      this.date.maxEventDate = this.query.maxEventDate || null

      this.specie = this.query.scientificName || null
      this.place = this.query.place || null
    }
  }

  componentDidLoad() {
    this.setTitle()
  }

  onSpecie(ev) {
    const item = (ev || {}).detail
    if (item) {
      const name = item.name || ''
      this.params.scientificName = name || null
    } else {
      this.params.scientificName = null
    }
  }

  onPlace(ev) {
    const item = (ev || {}).detail
    if (item && item.bbox) {
      this.params.decimalLatitude = [Number(item.bbox[0]), Number(item.bbox[1])]
      this.params.decimalLongitude = [Number(item.bbox[2]), Number(item.bbox[3])]
      this.params.place = item.name || null
    } else if (item) {
      const name = (item.name || '')
      this.params.scientificName = name || null
    } else {
      this.params.decimalLongitude = null
      this.params.decimalLatitude = null
      this.params.swlat = null
      this.params.swlng = null
      this.params.nelat = null
      this.params.nelng = null
      this.params.place = null
      this.params.scientificName = null
    }
  }

  cleanSpecie() {
    this.params.scientificName = null
    this.specie = null
  }
  cleanPlace() {
    this.place = null
    this.params.place = null
    this.params.decimalLongitude = null
    this.params.decimalLatitude = null
    this.params.swlat = null
    this.params.swlng = null
    this.params.nelat = null
    this.params.nelng = null
  }

  onSearchSelect(ev) {
    const item = (ev || {}).detail
    if (item && item.bbox) {
      this.params.decimalLatitude = [Number(item.bbox[0]), Number(item.bbox[1])]
      this.params.decimalLongitude = [Number(item.bbox[2]), Number(item.bbox[3])]
      this.params.place = item.name || null
      this.place = this.params.place
    } else if (item) {
      const name = item.name || this.term || ''
      this.params.scientificName = name || null
      this.specie = this.params.scientificName
    } else {
      this.params.decimalLongitude = null
      this.params.decimalLatitude = null
      this.params.swlat = null
      this.params.swlng = null
      this.params.nelat = null
      this.params.nelng = null
      this.params.place = null
      this.params.scientificName = null
      this.place = null
      this.specie = null
    }
  }

  onSearch() {
    console.log({term: this.term, m: this.matchSpecie}, [this.place, this.specie])
    if (this.term) {
      if (!this.matchSpecie && !this.place && !this.specie) {
        return this.presentAlert()
      }
      this.params.scientificName = this.specie = this.term
    }
    const iconic_taxa = Object.keys(this.iconic_taxa).map(key => {
      return this.iconic_taxa[key] === 'true' ? key : null
    }).filter(Boolean)
    this.params.iconic_taxa = iconic_taxa.length ? iconic_taxa.join(',') : null

    const origin = Object.keys(this.origin).map(key => {
      return this.origin[key] === 'true' ? key : null
    }).filter(Boolean)
    this.params.origin = origin.length ? origin.join(',') : null

    const license = Object.keys(this.license).map(key => {
      return this.license[key] === 'true' ? key : null
    }).filter(Boolean)
    this.params.license = license.length ? license.join(',') : null

    const quality = Object.keys(this.quality).map(key => {
      return this.quality[key] === 'true' ? key : null
    }).filter(Boolean)

    this.params.quality_grade = [
      quality.includes('casual') ? 'casual' : null,
      quality.includes('research') ? 'research' : null
    ].filter(Boolean).join(',') || null

    this.params.has = [
      quality.includes('geo') ? 'geo' : null,
      quality.includes('photos') ? 'photos' : null
    ].filter(Boolean).join(',') || null

    this.params.minEventDate = this.date.minEventDate || null
    this.params.maxEventDate = this.date.maxEventDate || null

    this.search.emit(this.params)
  }

  openFilters(key = 'all') {
    const offl = this.refs[key].offsetLeft
    this.filters[key].focus()
    this.filters[key].style.left = `${offl}px`
  }

  onChecked(ev, key = null) {
    if (key) {
      setTimeout(() => {
        const el = ev.detail
        this[key][el.value] = el.checked ? 'true' : 'false'
        this.setTitle()
      }, 200)
    } else {
      setTimeout(() => {
        const el = ev.detail
        this[el.value] = el.checked ? 'true' : 'false'
        this.setTitle()
      }, 200)
    }
  }

  when: any
  async setupDatePicker(ref1, ref2) {
    if (this.when) return null
    // const cssAwait = null//this.lazyCss('/assets/when.min.css')
    const jsAwait = import('/assets/when.min.js' as VanillajsDatepicker)
    await Promise.all([jsAwait])

    const varWhen = 'When'
    const when: any = window[varWhen]

    this.when = new when({
      input: ref1,
      // labelTo: this.labelTo,
      // labelFrom: this.labelFrom,
      locale: localStorage.lang || 'en',
      double: false,
      inline: false,
      singleDate: false,
      showHeader: true,
      container: ref2
    })

    const [yyyy, dd, mm] = (this.date.minEventDate || '').split('-')
    const [yyyy2, dd2, mm2] = (this.date.maxEventDate || '').split('-')
    const whenStr = [[dd, mm, yyyy].join('/'), [dd2, mm2, yyyy2].join('/')].join(' – ')
    ref1.innerHTML = whenStr.includes('//') ? this.i18n.filters.date : whenStr
    whenStr.includes('//') ? null : ref1.classList.add('active')
    return null
  }

  onMouseDown() {
    setTimeout(() => {
      this.setupDatePicker(this.refs.dateInput, this.refs.dateContainer)
    }, 100)

    setTimeout(() => {
      const calendar = this.refs.calendar.querySelector('.calendar')
      if (!calendar) return null
      // <ion-icon name="close-circle-outline"></ion-icon>
      const clear = document.createElement('ion-icon')
      const span = document.createElement('div')
      clear.setAttribute('name', 'refresh-circle-outline')
      clear.classList.add('clear')
      span.style.position = 'absolute'
      span.style.top = '0'
      span.style.right = '0'
      clear.style.fontSize = '20px'

      span.appendChild(clear)
      calendar.appendChild(span)
      span.addEventListener('click', () => this.clearDate())
      span.onclick = () => this.clearDate()
    }, 200)
  }
  onMouseUp($event) {
    if (!this.when) return setTimeout(() => this.onMouseUp($event), 200)
    setTimeout(() => {
      const calendar: any = this.refs.calendar.querySelector('.calendar')
      calendar && calendar.addEventListener('click', _ => {
        const dateInput: any = this.refs.dateInput
        const when = dateInput.value
        if (!when) {
          dateInput.innerHTML = this.i18n.filters.date
          return null
        }

        const leftDate = when.split(' – ')[0] || ''
        const rightDate = when.split(' – ')[1] || ''
        const [mm, dd, yyyy] = leftDate.split('/')
        const [mm2, dd2, yyyy2] = rightDate.split('/')
        this.date.minEventDate = leftDate.length > 4 ? [yyyy, mm, dd].join('-') : null
        this.date.maxEventDate = rightDate.length > 4 ? [yyyy2, mm2, dd2].join('-') : null
        dateInput.innerHTML = [
          leftDate.length > 4 ? [yyyy, mm, dd].join('/') : '',
          rightDate.length > 4 ? [yyyy2, mm2, dd2].join('/') : ''
        ].filter(Boolean).join(' – ')
        this.refs.dateInput.classList.add('active')
      })
      // const rest = window['innerHeight'] - $event.clientY

      calendar.parentNode.style.position = 'relative'
      calendar.parentNode.classList.add('calendar-div')
      calendar.classList.remove('top-left-triangle')
      calendar.classList.remove('top-right-triangle')
      calendar.classList.remove('.bottom-left-triangle')
      calendar.classList.remove('.bottom-right-triangle')
      const top = this.refs.dateInput.offsetTop
      // const left = this.refs.dateInput.offsetLeft

      calendar.style.top = `${top + 42}px`
      calendar.style.left = `${-330}px`
    }, 100)
  }

  clearDate() {
    const el = this.refs.dateContainer.firstElementChild as HTMLElement
    el.click()
    setTimeout(() => {
      this.date = {
        minEventDate: null,
        maxEventDate: null
      }

      this.refs.dateInput.innerHTML = this.i18n.filters.date
      this.refs.dateInput.classList.remove('active')
    }, 150)
  }

  get portalTitle() {
    return Object.entries(this.origin).filter(([_, v]) => v === 'true').map(([k]) => k).filter(Boolean).join('+') || null
  }
  get typeTitle() {
    return Object.entries(this.iconic_taxa).filter(([_, v]) => v === 'true').map(([k]) => k).filter(Boolean).join('+') || null
  }
  get qualityTitle() {
    return Object.entries(this.quality).filter(([_, v]) => v === 'true').map(([k]) => this.i18n.filters[k]).filter(Boolean).join('+') || null
  }
  get licenseTitle() {
    return Object.entries(this.license).filter(([_, v]) => v === 'true').map(([k]) => k).filter(Boolean).join('+') || null
  }

  setTitle() {
    const portal = this.portalTitle
    if (portal !== this.title.portal) {
      this.title.portal = portal
      this.refs.portals.innerHTML = this.title.portal || this.i18n.filters.portals
      if (portal) this.refs.portals && this.refs.portals.classList.add('active')
      else this.refs.portals && this.refs.portals.classList.remove('active')
    }
    const type = this.typeTitle
    if (type !== this.title.type) {
      this.title.type = type
      this.refs.types.innerHTML = this.title.type || this.i18n.filters.types
      if (type) this.refs.types && this.refs.types.classList.add('active')
      else this.refs.types && this.refs.types.classList.remove('active')
    }
    const quality = this.qualityTitle
    if (quality !== this.title.quality) {
      this.title.quality = quality
      this.refs.quality.innerHTML = this.title.quality || this.i18n.filters.quality
      if (quality) this.refs.quality && this.refs.quality.classList.add('active')
      else this.refs.quality && this.refs.quality.classList.remove('active')
    }
    const license = this.licenseTitle
    if (license !== this.title.license) {
      this.title.license = license
      this.refs.licenses.innerHTML = this.title.license || this.i18n.filters.licenses
      if (license) this.refs.licenses && this.refs.licenses.classList.add('active')
      else this.refs.licenses && this.refs.licenses.classList.remove('active')
    }
  }

  term: string = null
  matchSpecie: boolean = false
  onSearchValue(term) {
    console.log('onSearchValue => ', {term})
    this.term = term.detail.value
    this.matchSpecie = !!term.detail.match
  } 

  async presentAlert() {
    const alert: any = document.createElement('ion-alert');
    alert.cssClass = 'my-custom-class';
    alert.header = '⚠️';
    alert.subHeader = this.i18n.errorSearch;
    alert.message = this.i18n.selectSpeciePlace;
    alert.buttons = ['OK'];

    document.body.appendChild(alert);
    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  render() {
    return (
      <Host>

        <ion-grid class="app-grid">
          <ion-row>
            <ion-col size="9" size-sm="10">
              <app-searchbar
                value={this.place || this.specie}
                placeholder={this.i18n.filters.search}
                onChoose={(e) => this.onSearchSelect(e)}
                onSearchValue={(e) => this.onSearchValue(e)}
                service={GbifService}
                service2={PlacesService}></app-searchbar>

              <div class="float-chips-wrappers">
                {this.specie && <ion-chip>
                  <ion-label>{this.specie}</ion-label>
                  <ion-icon class="close-x" onClick={_ => this.cleanSpecie()} name="close-circle"></ion-icon>
                </ion-chip>}
                {this.place && <ion-chip>
                  <ion-label>{this.place}</ion-label>
                  <ion-icon class="close-x" onClick={_ => this.cleanPlace()} name="close-circle"></ion-icon>
                </ion-chip>}
              </div>
            </ion-col>

            <ion-col size="3" size-sm="2">
              <ion-button expand="block" onClick={() => this.onSearch()}>{this.i18n.filters.search}</ion-button>
            </ion-col>
          </ion-row>

          <ion-row class="center">
            <ion-col size="12" ref={e => this.refs.calendar = e}>

              <ion-chip
                ref={(e) => this.refs.portals = e}
                onClick={() => this.openFilters('portals')}>{this.portalTitle || this.i18n.filters.portals}</ion-chip>
              <ion-chip
                ref={(e) => this.refs.types = e}
                onClick={() => this.openFilters('types')}>{this.typeTitle || this.i18n.filters.types}</ion-chip>
              <ion-chip
                ref={(e) => this.refs.quality = e}
                onClick={() => this.openFilters('quality')}>{this.qualityTitle || this.i18n.filters.quality}</ion-chip>
              <ion-chip
                ref={(e) => this.refs.licenses = e}
                onClick={() => this.openFilters('licenses')}>{this.licenseTitle || this.i18n.filters.licenses}</ion-chip>

              <ion-chip
                ref={(e) => (this.refs.dateInput = e, this.onMouseDown())}
                onClick={() => this.onMouseDown()}
                onMouseUp={(e) => this.onMouseUp(e)}>{this.i18n.filters.date}</ion-chip>
              <span ref={e => this.refs.dateContainer = e}></span>

            </ion-col>
          </ion-row>

          <ion-row ref={(e) => this.filters.portals = e} tabIndex="-1" className="center row-filters">
            <div class="row-filters-container">
              <ion-list lines="none">
                <ion-label>{this.i18n.filters.portals}</ion-label>
                {this.origins.map(origin => <ion-item>
                  <ion-checkbox slot="start" value={origin}
                    checked={this.origin[origin]}
                    onIonChange={(ev) => this.onChecked(ev, 'origin')}></ion-checkbox>
                  <ion-label>{origin}</ion-label>
                </ion-item>)}
              </ion-list>
            </div>
          </ion-row>

          <ion-row ref={(e) => this.filters.types = e} tabIndex="-1" className="center row-filters">
            <div class="row-filters-container">
              <ion-list lines="none">
                <ion-label>{this.i18n.filters.types}</ion-label>
                {this.types.map(item => <ion-item>
                  <ion-checkbox slot="start" value={item.value}
                    checked={this.iconic_taxa[item.key]}
                    onIonChange={(ev) => this.onChecked(ev, 'iconic_taxa')}></ion-checkbox>
                  <ion-label>{item.label}</ion-label>
                </ion-item>)}
              </ion-list>
            </div>
          </ion-row>

          <ion-row ref={(e) => this.filters.quality = e} tabIndex="-1" className="center row-filters">
            <div class="row-filters-container">
              <ion-list lines="none">
                <ion-label>{this.i18n.filters.quality}</ion-label>
                {this.qualities.map(item => <ion-item>
                  <ion-checkbox slot="start" value={item.value}
                    checked={this.quality[item.key]}
                    onIonChange={(ev) => this.onChecked(ev, 'quality')}></ion-checkbox>
                  <ion-label>{this.i18n.filters[item.key]}</ion-label>
                </ion-item>)}
              </ion-list>
            </div>
          </ion-row>

          <ion-row ref={(e) => this.filters.licenses = e} tabIndex="-1" className="center row-filters">
            <div class="row-filters-container">
              <ion-list lines="none">
                <ion-label>{this.i18n.filters.licenses}</ion-label>
                {this.licenses.map(item => <ion-item>
                  <ion-checkbox slot="start" value={item.value}
                    checked={this.license[item.key]}
                    onIonChange={(ev) => this.onChecked(ev, 'license')}></ion-checkbox>
                  <ion-label>{item.label}</ion-label>
                </ion-item>)}
              </ion-list>
            </div>
          </ion-row>

        </ion-grid>

      </Host>
    );
  }

}
