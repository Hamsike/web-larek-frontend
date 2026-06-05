import { ensureElement } from "../../utils/utils";
import { Card, ICardData } from "../common/Card";

export interface ICardGalleryData extends ICardData {
  image: string
  category: string
}

interface ICardGalleryAction {
  onClick: (e: MouseEvent) => void
}

export class CardGallery<T extends ICardGalleryData> extends Card<T> {
  protected _categoryElement: HTMLElement;
  protected _imageElement: HTMLImageElement;
  protected _categoryColor: Record<string, string> = {
    "софт-скил": "soft",
    "другое": "other",
    "дополнительное": "additional",
    "кнопка": "button",
    "хард-скил": "hard"
  }

  constructor(container: HTMLElement, action?: ICardGalleryAction) {
    super(container)

    this._categoryElement = ensureElement<HTMLElement>('.card__category', container)
    this._imageElement = ensureElement<HTMLImageElement>('.card__image', container);

    if (action?.onClick) {
      container.addEventListener('click', action.onClick)
    }
  }

  set image(value: string) {
    this.setImage(this._imageElement, value)
  }

  set category(value: string) {
    this.setText(this._categoryElement, value)
    this._categoryElement.className = `card__category card__category_${this._categoryColor[value]}`
  }
}