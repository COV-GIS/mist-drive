import esri = __esri;

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';

import { tsx } from '@arcgis/core/widgets/support/widget';

import Widget from '@arcgis/core/widgets/Widget';

import PopupTemplate from '@arcgis/core/PopupTemplate';

import CustomContent from '@arcgis/core/popup/content/CustomContent';

interface ContentProperties extends esri.WidgetProperties {
  graphic: esri.Graphic;
}

const CSS = {
  th: 'esri-feature__field-header',
  td: 'esri-feature__field-data',
};

@subclass('cov.popups.TaxLotPopup.Content')
class Content extends Widget {
  @property()
  graphic!: esri.Graphic;

  constructor(properties: ContentProperties) {
    super(properties);
  }

  render(): tsx.JSX.Element {
    const attributes = this.graphic.attributes;

    if (attributes.BNDY_CLIPPED) {
      return (
        <p>
          Note: This tax lot is clipped to the City of Vernonia area spatial extent. No tax lot data is provided here.
          Please visit the{' '}
          <a href="https://www.columbiacountyor.gov/departments/Assessor" target="_blank" rel="noopener">
            Columbia County Assessor's
          </a>{' '}
          web site for tax lot information.
        </p>
      );
    }

    return (
      <div class="esri-feature">
        <div class="esri-feature__size-container">
          <div class="esri-feature__main-container">
            <div>
              <div class="esri-feature__fields esri-feature__content-element">
                <table class="esri-widget__table">
                  {/* tax lot id */}
                  <tr>
                    <th class={CSS.th}>Tax Lot</th>
                    {attributes.VERNONIA === 1 ? (
                      <td class={CSS.td}>
                        <a href={`https://www.vernonia-or.gov/tax-lot/${attributes.TAXLOT_ID}/`} target="_blank">
                          {attributes.TAXLOT_ID}
                        </a>
                      </td>
                    ) : (
                      <td class={CSS.td}>{attributes.TAXLOT_ID}</td>
                    )}
                  </tr>

                  {/* owner */}
                  <tr>
                    <th class={CSS.th}>Owner</th>
                    <td class={CSS.td}>{attributes.OWNER}</td>
                  </tr>

                  {/* address */}
                  {attributes.ADDRESS ? (
                    <tr>
                      <th class={CSS.th}>Address</th>
                      <td class={CSS.td}>
                        <a
                          href={`https://www.google.com/maps/place/${attributes.ADDRESS.split(' ').join('+')}+${
                            attributes.CITY
                          }=${attributes.STATE}+${attributes.ZIP}/data=!3m1!1e3`}
                          target="_blank"
                          rel="noopener"
                        >
                          {attributes.ADDRESS}
                        </a>
                      </td>
                    </tr>
                  ) : null}

                  {/* tax map */}
                  <tr>
                    <th class={CSS.th}>Tax Map</th>
                    <td class={CSS.td}>
                      <a
                        href={`http://65.122.151.216/geomoose2/taxlots_map_images/${attributes.TAXMAP}`}
                        target="_blank"
                        rel="noopener"
                      >
                        {`${attributes.TOWN}${attributes.TOWN_DIR}${attributes.RANGE}${attributes.RANGE_DIR} ${attributes.SECTION} ${attributes.QTR}${attributes.QTR_QTR}`}
                      </a>
                    </td>
                  </tr>

                  {/* tax accounts */}
                  <tr>
                    <th class={CSS.th}>Tax Account(s)</th>
                    <td class={CSS.td}>
                      {attributes.ACCOUNT_IDS.split(',').map((accountId: string) => {
                        return (
                          <a
                            style="margin-right:0.75rem;"
                            href={`http://www.helioncentral.com/columbiaat/MainQueryDetails.aspx?AccountID=${accountId}&QueryYear=2021&Roll=R`}
                            target="_blank"
                            rel="noopener"
                          >
                            {accountId}
                          </a>
                        );
                      })}
                    </td>
                  </tr>

                  {/* area */}
                  <tr>
                    <th class={CSS.th}>Area</th>
                    <td class={CSS.td}>
                      <span style="margin-right:0.75rem;">{`${attributes.ACRES} acres`}</span>
                      <span>{`${attributes.SQ_FEET.toLocaleString()} sq ft`}</span>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

@subclass('cov.popups.TaxLotPopup')
export default class TaxLotPopup extends PopupTemplate {
  @property()
  title = `{TAXLOT_ID}`;

  @property()
  outFields = ['*'];

  @property()
  customContent = new CustomContent({
    outFields: ['*'],
    creator: (evt: any): Widget => {
      return new Content({
        graphic: evt.graphic,
      });
    },
  });

  @property()
  content = [this.customContent];
}
