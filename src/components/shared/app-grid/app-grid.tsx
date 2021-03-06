import { Component, Event, EventEmitter, Prop, h } from '@stencil/core';
import { RouterHistory } from '@stencil/router';

@Component({
  tag: 'app-grid',
  styleUrl: 'app-grid.css',
  shadow: true,
})
export class AppGrid {

  @Prop() items: any[];
  @Prop() images: any;
  @Prop({reflect: true}) title: string;
  @Prop({reflect: true}) empty: string;
  @Prop() showSpinner: boolean = false
  @Event() loadmore: EventEmitter<any>;
  @Prop() history: RouterHistory;

  refs: { [key: string]: HTMLElement } = {};

  spinner: HTMLElement;
  observer;

  setSpinnerEl(el) {
    this.spinner = el
    const callback = (entries, _) => {
      entries.forEach(entry => {
        if (entry.intersectionRatio > 0) {
          this.loadmore.emit()
        }
      })
    }
    if (!this.observer) {
      this.observer = new IntersectionObserver(callback, {})
      this.observer.observe(el)
    }
  }

  render() {
    return (
      <div class="container-grid">
        {this.title && <h3 innerHTML={this.title}></h3>}
        <h4 ref={e => this.refs.h4 = e} innerHTML={this.empty}></h4>
        <div class="grid">
          {this.items.map(item => <card-item item={item} image={this.images[item.ID]}></card-item>)}
        </div>
        {
          <div class={'spinner ' + (this.showSpinner ? 'show' : '')} ref={(el) => this.setSpinnerEl(el)}>
            <ion-spinner></ion-spinner>
          </div>
        }
      </div>
    );
  }

}
