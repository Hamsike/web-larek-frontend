import { ensureElement } from "../../utils/utils";
import { Card} from "../common/Card";
import { ICardGalleryData } from "./CardGallery";

interface ICardPreviewData extends ICardGalleryData{
  description?: string;
  isCanAdd: boolean
}

interface ICardPreviewButtonAction {
  onButtonClick?: (event: MouseEvent) => void;
}

export class CardPreview extends Card<ICardPreviewData> {
  private _descriptionElement: HTMLElement
  private _actionButton : HTMLElement | null

  constructor(container: HTMLElement, actions?: ICardPreviewButtonAction) {
    super(container)

    this._actionButton= container.querySelector(`.card__button`);
    this._descriptionElement = ensureElement<HTMLElement>(`.card__text`, container);

    if (actions?.onButtonClick) {
      this._actionButton?.addEventListener('click', actions.onButtonClick)
    }
  }

  set description(value: string) {
    this.setText(this._descriptionElement, value)
  }

  set isCanAdd(value: boolean) {
    this.setDisabled(this._actionButton, !value)
  }

}