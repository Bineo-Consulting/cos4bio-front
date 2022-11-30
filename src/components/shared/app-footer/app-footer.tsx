import { Component, Host, h } from '@stencil/core';
import { fetchTranslations, getLocale } from '../../../utils/translation'

@Component({
  tag: 'app-footer',
  styleUrl: 'app-footer.css',
  shadow: true,
})
export class AppFooter {

  i18n: any = {
    footer: {
      about: 'About',
      help: 'Help',
      privacy: 'Privacy',
      terms: 'Terms',
      contact: 'Contact',
      follow_us: 'Follow Us'
    }
  }
  langs = ['es', 'en']
  lang: string

  async componentWillLoad() {
    this.i18n = await fetchTranslations()
    this.lang = this.langs.includes(getLocale()) ? getLocale() : 'en'
  }

  async openContact() {
    const modalElement: any = document.createElement('ion-modal');
    modalElement.component = 'modal-contact';
    document.body.appendChild(modalElement);
    await modalElement.present();
    await modalElement.onWillDismiss();
  }

  render() {
    return (
      <Host>
        <footer>
          <div class="cnt-footer">
            <div class="nav-footer">
              <div class="tabs">
                <a href={`/${this.lang}/about.html`} target="_blank" innerHTML={this.i18n.footer.about}></a>
                <a href={`/${this.lang}/terms.html`} target="_blank" innerHTML={this.i18n.footer.term}></a>
                <a onClick={() => this.openContact()} target="_blank" innerHTML={this.i18n.footer.contact}></a>
                <a href={`/${this.lang}/help.html`} target="_blank" innerHTML={this.i18n.footer.help}></a>
                <a href="/apidoc/index.html" target="_blank">API</a>
              </div>
              <div class="logowrap">
                <a href="https://cos4cloud-eosc.eu/" rel="noopener" target="_blank">
                  <img src="https://cos4cloud-eosc.eu/wp-content/uploads/2020/07/logo-cos4cloud-middle.png" alt="logo cos4cloud project"/>
                </a>
                <a href="https://marketplace.eosc-portal.eu/services/cos4bio" rel="noopener" target="_blank">
                  <img class="ml-x" src="https://marketplace.eosc-portal.eu/packs/media/images/eosc-logo-color-883f208671ef77b15b9cd067ecdc369b.png" alt="logo eosc"/>
                </a>
              </div>
            </div>

            <div class="rrss">
              <p innerHTML={this.i18n.footer.follow_us}></p>
              <div class="icons-rrss">
                <a href="https://www.linkedin.com/company/cos4cloud-project/" target="_blank"><img loading="lazy" src="./assets/svg/in-logo.svg" alt="Linkedin logo"/></a>
                <a href="https://twitter.com/Cos4Cloud" target="_blank"><img loading="lazy" src="./assets/svg/tw-logo.svg" alt="Twitter logo"/></a>
                <a href="https://www.instagram.com/cos4cloud/" target="_blank"><img loading="lazy" src="./assets/svg/ig-logo.svg" alt="Instagram logo"/></a>
                <a href="https://www.youtube.com/channel/UC38cKrW3viJrb0GM1JrWAQw" target="_blank"><img loading="lazy" src="./assets/svg/yt-logo.svg" alt="Youtube logo"/></a>
              </div>
            </div>
            <div class="eu">
              <p class="db"><span innerHTML={this.i18n.footer.h2020}></span></p>
              <img src="/assets/img/eu.jpg" width="100"/>
            </div>
          </div>
        </footer>
      </Host>
    );
  }

}
