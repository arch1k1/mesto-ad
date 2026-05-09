const getErrorElement = (inputElement) =>
  document.getElementById(`${inputElement.id}-error`);

const showInputError = (formElement, inputElement, config, errorMessage) => {
  const errorElement = getErrorElement(inputElement);
  if (!errorElement) return;

  inputElement.classList.add(config.inputErrorClass);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(config.errorClass);
};

const hideInputError = (formElement, inputElement, config) => {
  const errorElement = getErrorElement(inputElement);
  if (!errorElement) return;

  inputElement.classList.remove(config.inputErrorClass);
  errorElement.textContent = "";
  errorElement.classList.remove(config.errorClass);
};

const hasInvalidInput = (inputList) => inputList.some((inputElement) => !inputElement.validity.valid);

const disableSubmitButton = (buttonElement, config) => {
  if (!buttonElement) return;
  buttonElement.disabled = true;
  buttonElement.classList.add(config.inactiveButtonClass);
};

const enableSubmitButton = (buttonElement, config) => {
  if (!buttonElement) return;
  buttonElement.disabled = false;
  buttonElement.classList.remove(config.inactiveButtonClass);
};

const toggleButtonState = (inputList, buttonElement, config) => {
  if (hasInvalidInput(inputList)) {
    disableSubmitButton(buttonElement, config);
  } else {
    enableSubmitButton(buttonElement, config);
  }
};

/** Тот же набор символов, что в pattern полей «Имя» и «Название» (index.html). */
const NAME_LIKE_ALLOWED_CHARS = /^[-a-zA-Zа-яА-ЯёЁ ]*$/u;

const shouldUseCustomPatternMessage = (inputElement) => {
  const custom = inputElement.dataset?.errorMessage;
  if (!custom || inputElement.type !== "text") return false;
  if (inputElement.validity.valueMissing) return false;
  if (!NAME_LIKE_ALLOWED_CHARS.test(inputElement.value)) return true;
  if (inputElement.validity.tooShort || inputElement.validity.tooLong) return false;
  return inputElement.validity.patternMismatch;
};

const checkInputValidity = (formElement, inputElement, config) => {
  if (!inputElement.validity.valid) {
    const errorMessage = shouldUseCustomPatternMessage(inputElement)
      ? inputElement.dataset.errorMessage
      : inputElement.validationMessage;
    showInputError(formElement, inputElement, config, errorMessage);
  } else {
    hideInputError(formElement, inputElement, config);
  }
};

const setEventListeners = (formElement, config) => {
  const inputList = Array.from(formElement.querySelectorAll(config.inputSelector));
  const buttonElement = formElement.querySelector(config.submitButtonSelector);

  const validateFormInputs = () => {
    inputList.forEach((input) => {
      checkInputValidity(formElement, input, config);
    });
    toggleButtonState(inputList, buttonElement, config);
  };

  toggleButtonState(inputList, buttonElement, config);

  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", validateFormInputs);
  });
};

export const enableValidation = (config) => {
  const formList = Array.from(document.querySelectorAll(config.formSelector));
  formList.forEach((formElement) => setEventListeners(formElement, config));
};

export const clearValidation = (formElement, config) => {
  const inputList = Array.from(formElement.querySelectorAll(config.inputSelector));
  const buttonElement = formElement.querySelector(config.submitButtonSelector);

  inputList.forEach((inputElement) => hideInputError(formElement, inputElement, config));
  toggleButtonState(inputList, buttonElement, config);
};
