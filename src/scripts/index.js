/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { createCardElement, deleteCard, updateCardLikeView } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import {
  getUserInfo,
  setUserInfo,
  setUserAvatar,
  getCardList,
  addCard,
  removeCard,
  changeLikeCardStatus,
} from "./components/api.js";
import { enableValidation, clearValidation } from "./components/validation.js";

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");
const profileSubmitButton = profileForm.querySelector(".popup__button");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const cardSubmitButton = cardForm.querySelector(".popup__button");

const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow?.querySelector(".popup__form");
const removeCardSubmitButton = removeCardModalWindow?.querySelector(".popup__button");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");
const avatarSubmitButton = avatarForm.querySelector(".popup__button");

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoTitle = cardInfoModalWindow.querySelector(".popup__title");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoLikesTitle = cardInfoModalWindow.querySelector(".popup__text");
const cardInfoLikesList = cardInfoModalWindow.querySelector(".popup__list");
const infoDefinitionTemplate = document.getElementById("popup-info-definition-template");
const infoUserPreviewTemplate = document.getElementById("popup-info-user-preview-template");

const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

let currentUserId = null;
let pendingRemove = null;
let profileFormBaseline = { name: "", about: "" };

const setFormSubmitEnabled = (buttonElement, enabled) => {
  if (!buttonElement) return;
  buttonElement.disabled = !enabled;
  buttonElement.classList.toggle(validationConfig.inactiveButtonClass, !enabled);
};

const syncProfileSubmitButtonState = () => {
  const inputs = [profileTitleInput, profileDescriptionInput];
  const hasInvalid = inputs.some((inputElement) => !inputElement.validity.valid);
  const unchanged =
    profileTitleInput.value === profileFormBaseline.name &&
    profileDescriptionInput.value === profileFormBaseline.about;
  setFormSubmitEnabled(profileSubmitButton, !hasInvalid && !unchanged);
};

const renderLoading = (isLoading, buttonElement, { defaultText, loadingText }) => {
  if (!buttonElement) return;
  buttonElement.textContent = isLoading ? loadingText : defaultText;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(true, profileSubmitButton, { defaultText: "Сохранить", loadingText: "Сохранение..." });
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch(() => {})
    .finally(() => {
      renderLoading(false, profileSubmitButton, { defaultText: "Сохранить", loadingText: "Сохранение..." });
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(true, avatarSubmitButton, { defaultText: "Сохранить", loadingText: "Сохранение..." });
  setUserAvatar({ avatar: avatarInput.value })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch(() => {})
    .finally(() => {
      renderLoading(false, avatarSubmitButton, { defaultText: "Сохранить", loadingText: "Сохранение..." });
    });
};

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, description) => {
  const element = infoDefinitionTemplate.content
    .querySelector(".popup__info-item")
    .cloneNode(true);
  element.querySelector(".popup__info-term").textContent = term;
  element.querySelector(".popup__info-description").textContent = description;
  return element;
};

const createUserPreview = (userName) => {
  const element = infoUserPreviewTemplate.content
    .querySelector(".popup__list-item")
    .cloneNode(true);
  element.textContent = userName;
  return element;
};

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find((c) => c._id === cardId);
      if (!cardData) {
        return Promise.reject("Карточка не найдена");
      }

      cardInfoTitle.textContent = "Информация о карточке";

      cardInfoModalInfoList.replaceChildren();
      cardInfoLikesList.replaceChildren();

      const likes = cardData.likes ?? [];
      cardInfoModalInfoList.append(
        createInfoString("Описание:", cardData.name ?? "—"),
        createInfoString("Дата создания:", formatDate(new Date(cardData.createdAt))),
        createInfoString("Владелец:", cardData.owner?.name ?? "—"),
        createInfoString("Количество лайков:", String(likes.length))
      );

      cardInfoLikesTitle.textContent = "Лайкнули:";
      likes.forEach((user) => {
        cardInfoLikesList.append(createUserPreview(user.name));
      });

      openModalWindow(cardInfoModalWindow);
    })
    .catch(() => {});
};

const handleLike = ({ cardId, isLiked, likeButton, likeCountElement }) => {
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      const likedNow = Boolean(updatedCard.likes?.some((user) => user._id === currentUserId));
      updateCardLikeView({
        likeButton,
        likeCountElement,
        isLiked: likedNow,
        likesCount: updatedCard.likes?.length ?? 0,
      });
    })
    .catch(() => {});
};

const handleDelete = ({ cardId, cardElement }) => {
  pendingRemove = { cardId, cardElement };
  if (removeCardForm) {
    clearValidation(removeCardForm, validationConfig);
  }
  openModalWindow(removeCardModalWindow);
};

const renderCard = (cardData, method = "append") => {
  const cardElement = createCardElement(
    cardData,
    {
      onPreviewPicture: handlePreviewPicture,
      onLike: handleLike,
      onDelete: handleDelete,
      onInfo: handleInfoClick,
    },
    currentUserId
  );
  placesWrap[method](cardElement);
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(true, cardSubmitButton, { defaultText: "Создать", loadingText: "Создание..." });
  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      renderCard(cardData, "prepend");
      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
      clearValidation(cardForm, validationConfig);
    })
    .catch(() => {})
    .finally(() => {
      renderLoading(false, cardSubmitButton, { defaultText: "Создать", loadingText: "Создание..." });
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);
if (removeCardForm) {
  removeCardForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    if (!pendingRemove) return;

    const { cardId, cardElement } = pendingRemove;
    renderLoading(true, removeCardSubmitButton, { defaultText: "Да", loadingText: "Удаление..." });

    removeCard(cardId)
      .then(() => {
        deleteCard(cardElement);
        closeModalWindow(removeCardModalWindow);
        pendingRemove = null;
      })
      .catch(() => {})
      .finally(() => {
        renderLoading(false, removeCardSubmitButton, { defaultText: "Да", loadingText: "Удаление..." });
      });
  });
}

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  profileFormBaseline = {
    name: profileTitle.textContent,
    about: profileDescription.textContent,
  };
  clearValidation(profileForm, validationConfig);
  syncProfileSubmitButtonState();
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationConfig);
  openModalWindow(cardFormModalWindow);
});

enableValidation(validationConfig);

[profileTitleInput, profileDescriptionInput].forEach((inputElement) => {
  inputElement.addEventListener("input", syncProfileSubmitButtonState);
});

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((cardData) => {
      renderCard(cardData, "append");
    });
  })
  .catch(() => {});

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});
