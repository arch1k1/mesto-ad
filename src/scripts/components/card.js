export const likeCard = (likeButton) => {
  likeButton.classList.toggle("card__like-button_is-active");
};

export const updateCardLikeView = ({ likeButton, likeCountElement, isLiked, likesCount }) => {
  if (likeButton) {
    likeButton.classList.toggle("card__like-button_is-active", isLiked);
  }
  if (likeCountElement) {
    likeCountElement.textContent = likesCount;
  }
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLike, onDelete, onInfo },
  currentUserId
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCountElement = cardElement.querySelector(".card__like-count");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const infoButton = cardElement.querySelector(".card__control-button_type_info");
  const cardImage = cardElement.querySelector(".card__image");

  cardElement.dataset.cardId = data._id;

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  if (likeCountElement) {
    likeCountElement.textContent = data.likes?.length ?? 0;
  }

  const isLikedByMe = Boolean(data.likes?.some((user) => user._id === currentUserId));
  if (isLikedByMe) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (onLike) {
    likeButton.addEventListener("click", () => {
      const isLiked = likeButton.classList.contains("card__like-button_is-active");
      onLike({
        cardId: data._id,
        isLiked,
        likeButton,
        likeCountElement,
      });
    });
  }

  if (onDelete && deleteButton) {
    const ownerId = data.owner?._id;
    if (!ownerId || ownerId !== currentUserId) {
      deleteButton.remove();
    } else {
      deleteButton.addEventListener("click", () => {
        onDelete({ cardId: data._id, cardElement });
      });
    }
  }

  if (onInfo && infoButton) {
    infoButton.addEventListener("click", () => onInfo(data._id));
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () =>
      onPreviewPicture({ name: data.name, link: data.link })
    );
  }

  return cardElement;
};
