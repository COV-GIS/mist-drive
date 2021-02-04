/**
 * Simple print widget in calcite (not production ready).
 */
import { whenOnce } from '@arcgis/core/core/watchUtils';

import '@esri/calcite-components';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import { renderable, tsx } from '@arcgis/core/widgets/support/widget';
import Widget from '@arcgis/core/widgets/Widget';

import PrintViewModel from '@arcgis/core/widgets/Print/PrintViewModel';
import PrintTemplate from '@arcgis/core/tasks/support/PrintTemplate';

export interface PrintProperties extends esri.WidgetProperties {
  view: esri.MapView | esri.SceneView;
  printServiceUrl: string;
  printTitle?: string;
}

interface PrintResult extends Object {
  state: 'printing' | 'printed' | 'error';
  titleText: string;
  url: null | string;
}

const CSS = {
  base: 'esri-widget cov-print',
  results: 'cov-print--results',
  result: 'cov-print--result',
  spin: 'esri-rotating',
  icon: 'cov-print--result-icon',
};

let KEY = 0;

@subclass('cov.widgets.Print')
export default class Print extends Widget {
  /**
   * Constructor properties.
   */
  @property()
  view!: esri.MapView | esri.SceneView;

  @property()
  printServiceUrl!: string;

  @property()
  printTitle = 'Print Map';

  /**
   * Widget properties.
   */
  @property()
  private _printer = new PrintViewModel();

  @property()
  private _titleInput: tsx.JSX.Element = (
    <calcite-input scale="s" type="text" value={this.printTitle} placeholder="Map title"></calcite-input>
  );

  @property()
  @renderable()
  private _layoutSelect!: tsx.JSX.Element;

  @property()
  @renderable()
  private _formatSelect!: tsx.JSX.Element;

  @property()
  @renderable()
  private _results: PrintResult[] = [];

  constructor(properties: PrintProperties) {
    super(properties);

    whenOnce(this, 'view', (view: esri.MapView) => {
      this._printer.view = view;
      this._printer.printServiceUrl = this.printServiceUrl;
      this._printer.load().then(this._createSelects.bind(this)).catch();
    });
  }

  private _createSelects(printer: PrintViewModel): void {
    const {
      templatesInfo: { format, layout },
    } = printer;

    this._layoutSelect = (
      <calcite-select scale="s">
        {layout.choiceList.map((choice: 'string') => {
          return (
            <calcite-option
              label={choice.replaceAll('-', ' ')}
              value={choice}
              selected={layout.defaultValue === choice}
            ></calcite-option>
          );
        })}
      </calcite-select>
    );

    this._formatSelect = (
      <calcite-select scale="s">
        {format.choiceList.map((choice: 'string') => {
          return (
            <calcite-option
              label={choice.replaceAll('-', ' ')}
              value={choice}
              selected={format.defaultValue === choice}
            ></calcite-option>
          );
        })}
      </calcite-select>
    );
  }

  private _createResults(): tsx.JSX.Element[] {
    return this._results.map((result: PrintResult) => {
      const { state, titleText, url } = result;
      switch (state) {
        case 'printing':
          return (
            <div key={KEY++} class={CSS.result}>
              <calcite-icon class={this.classes(CSS.spin, CSS.icon)} icon="spinner" scale="s"></calcite-icon>
              {titleText}
            </div>
          );
        case 'printed':
          return (
            <div key={KEY++} class={CSS.result} title={`Download ${titleText}`}>
              <calcite-icon class={CSS.icon} icon="download" scale="s"></calcite-icon>
              <calcite-link href={url} target="_blank">
                {titleText}
              </calcite-link>
            </div>
          );
        case 'error':
          return (
            <div key={KEY++} class={CSS.result} style="color:var(--calcite-ui-red-1)" title="Printing failed">
              <calcite-icon class={CSS.icon} icon="exclamationMarkCircle" scale="s"></calcite-icon>
              {titleText}
            </div>
          );
        default:
          return <div></div>;
      }
    });
  }

  private _print(): void {
    const { _printer, _titleInput, _layoutSelect, _formatSelect, _results } = this;

    //@ts-ignore
    const titleText = (_titleInput.domNode as HTMLCalciteInputElement).value;
    //@ts-ignore
    const format = (_formatSelect.domNode as HTMLCalciteSelectElement).selectedOption.value as any;
    //@ts-ignore
    const layout = (_layoutSelect.domNode as HTMLCalciteSelectElement).selectedOption.value as any;

    if (!titleText) {
      console.log(_titleInput);
      //@ts-ignore
      (_titleInput.domNode as HTMLCalciteInputElement).setFocus();
      return;
    }

    const result: PrintResult = {
      state: 'printing',
      titleText,
      url: '',
    };
    _results.push(result);

    _printer
      .print(
        new PrintTemplate({
          format,
          layout,
          layoutOptions: {
            titleText,
          },
        }),
      )
      .then((printResult: any): void => {
        result.state = 'printed';
        result.url = printResult.url;
      })
      .catch((printError: any): void => {
        console.log(printError);
        result.state = 'error';
      })
      .then(this.scheduleRender.bind(this));
  }

  render(): tsx.JSX.Element {
    return (
      <div class={CSS.base}>
        <calcite-block
          style="margin:0;"
          heading="Print a map"
          summary="Add a title and select a layout and format"
          open=""
        >
          <calcite-icon slot="icon" icon="print" scale="m" aria-hidden="true"></calcite-icon>
          <calcite-label>
            Title
            {this._titleInput}
          </calcite-label>
          <calcite-label>
            Layout
            {this._layoutSelect}
          </calcite-label>
          <calcite-label>
            Format
            {this._formatSelect}
          </calcite-label>
          <calcite-button
            scale="s"
            appearance="solid"
            color="blue"
            alignment="center"
            width="full"
            bind={this}
            onclick={this._print.bind(this)}
          >
            Print
          </calcite-button>

          <div class={this._results.length ? CSS.results : ''}>{this._createResults()}</div>
        </calcite-block>
      </div>
    );
  }
}
