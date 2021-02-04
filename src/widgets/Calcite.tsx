import '@esri/calcite-components';

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';

import { renderable, tsx } from '@arcgis/core/widgets/support/widget';

import Widget from '@arcgis/core/widgets/Widget';
import { whenOnce } from '@arcgis/core/core/watchUtils';

export interface CalciteProperties extends esri.WidgetProperties {
  view?: esri.MapView | esri.SceneView;
}

const CSS = {
  base: 'cov-calcite',
};

@subclass('cov.widgets.Calcite')
export default class Calcite extends Widget {
  /**
   * Constructor properties.
   */
  @property()
  view!: esri.MapView | esri.SceneView;

  /**
   * Class properties.
   */

  // panel collapse state `true = collapsed`
  @property()
  @renderable()
  private _leftPanelCollapseState = true;

  @property()
  @renderable()
  private _rightPanelCollapseState = true;

  constructor(properties?: CalciteProperties) {
    super(properties);

    whenOnce(this, 'view', (view: esri.MapView) => {
      setTimeout(() => {
        view.container = document.querySelector('div[data-view-container]') as HTMLDivElement;
      }, 0);
    });
  }


  /**
   * Operate panel collapse state.
   * @param panel 
   * @param operation 
   */
  private _operatePanel(panel: 'left' | 'right', operation: 'toggle' | 'open' | 'close'): void {
    switch (operation) {
      case 'toggle':
        panel === 'left' ? this._leftPanelCollapseState = !this._leftPanelCollapseState : this._rightPanelCollapseState = !this._rightPanelCollapseState;
        break;
      case 'open':
        if (panel === 'left') this._leftPanelCollapseState = false;
        if (panel === 'right') this._rightPanelCollapseState = false;
        break;
      case 'close':
        if (panel === 'left') this._leftPanelCollapseState = true;
        if (panel === 'right') this._rightPanelCollapseState = true;
        break;
      default:
        break;
    }
  }

  render(): tsx.JSX.Element {
    const { _leftPanelCollapseState, _rightPanelCollapseState } = this;

    return (
      <calcite-shell class={CSS.base}>
        {/* ^ calcite-shell can be safely used as the root node but most components cannot */}

        {/* right panel */}
        <calcite-shell-panel position="start" collapsed={_leftPanelCollapseState}>

          {/* right action bar */}
          <calcite-action-bar theme="dark" expand="" slot="action-bar">
            <calcite-action-group>
              <calcite-action text="Add" label="Add Item" icon="plus" bind={this} onclick={this._operatePanel.bind(this, 'left', 'toggle')}></calcite-action>
              <calcite-action text="Save" label="Save Item" icon="save"></calcite-action>
            </calcite-action-group>
          </calcite-action-bar>

          {/* right panel content */}
          <calcite-block heading="Vernonia"></calcite-block>

        </calcite-shell-panel>

        {/* view container */}
        <div data-view-container=""></div>

        {/* left panel */}
        <calcite-shell-panel position="end" collapsed={_rightPanelCollapseState}>

          {/* left action bar */}
          <calcite-action-bar expand="" slot="action-bar" data-action-bar="right">
            <calcite-action-group>
              <calcite-action text="Add" label="Add Item" icon="plus"></calcite-action>
              <calcite-action text="Save" label="Save Item" icon="save"></calcite-action>
            </calcite-action-group>
          </calcite-action-bar>

          {/* left panel content */}

        </calcite-shell-panel>
      </calcite-shell>
    );
  }
}
