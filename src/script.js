const dataStep = document.getElementById("data-step");
const dataInputFile = document.getElementById("data-input-file");
const dataInputText = document.getElementById("data-input-text");
const useFileInputButton = document.getElementById("useFileInputButton");
const useTextInputButton = document.getElementById("useTextInputButton");

const setupStep = document.getElementById("setup-step");
const sortingStep = document.getElementById("sorting-step");
const resultStep = document.getElementById("result-step");

let data;
let groupNames;
let result = {};
let currentItemIndex = 0;

const keyToGroupMap = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'top',
  ArrowDown: 'bottom',
}

function parseData(string) {
  try {
    return JSON.parse(string);
  } catch (e) {
    return null;
  }
}

function hide(el) { el.classList.add('hidden'); }
function show(el) { el.classList.remove('hidden'); }

function enable(el) { el.removeAttribute('disabled') }
function disable(el) { el.setAttribute('disabled', 'disabled') }

function unlockTextInputButtonIfPossible() {
  if (dataInputText.value === '') {
    disable(useTextInputButton)
  } else {
    enable(useTextInputButton)
  }
}

function unlockFileInputButtonIfPossible() {
  if (!dataInputFile.files[0] || dataInputFile.files[0].type !== 'application/json') {
    disable(useFileInputButton)
  } else {
    enable(useFileInputButton)
  }
}

unlockFileInputButtonIfPossible();
unlockTextInputButtonIfPossible();

dataInputText.addEventListener('input', unlockTextInputButtonIfPossible)
dataInputFile.addEventListener('input', unlockFileInputButtonIfPossible)

useFileInputButton.addEventListener('click', function () {
  const reader = new FileReader();
  reader.readAsText(dataInputFile.files[0], 'UTF-8');
  reader.onload = function (e) {
    const parsedData = parseData(e.target.result);
    if (parseData === null) return;
    data = parsedData;
    goToSetupStep()
  }
})

useTextInputButton.addEventListener('click', function () {
  const parsedData = parseData(dataInputText.value);
  if (parseData === null) return;

  data = parsedData;
  goToSetupStep()
})

function goToSetupStep() {
  hide(dataStep);
  show(setupStep);
}

const setupGroupLeftInput = document.getElementById('setup-group-left');
const setupGroupRightInput = document.getElementById('setup-group-right');
const setupGroupTopInput = document.getElementById('setup-group-top');
const setupGroupBottomInput = document.getElementById('setup-group-bottom');

const formatterInput = document.getElementById('setup-step-formatter');

const goToSortStepButton = document.getElementById('goToSortStepButton');

function toggleGoToSortStepButtonIfFieldsAreEmpty() {
  const groupNames = [
    setupGroupLeftInput.value,
    setupGroupRightInput.value,
    setupGroupTopInput.value,
    setupGroupBottomInput.value,
  ]

  const atLeastTwoGroupsExist = groupNames.filter((groupName) => !!groupName).length > 1;

  if (atLeastTwoGroupsExist) {
    enable(goToSortStepButton)
  } else {
    disable(goToSortStepButton)
  }
}

setupGroupLeftInput.addEventListener('input', toggleGoToSortStepButtonIfFieldsAreEmpty)
setupGroupRightInput.addEventListener('input', toggleGoToSortStepButtonIfFieldsAreEmpty)
setupGroupTopInput.addEventListener('input', toggleGoToSortStepButtonIfFieldsAreEmpty)
setupGroupBottomInput.addEventListener('input', toggleGoToSortStepButtonIfFieldsAreEmpty)

goToSortStepButton.addEventListener('click', goToSortStep)

function goToSortStep() {
  groupNames = {
    left: setupGroupLeftInput.value || null,
    right: setupGroupRightInput.value || null,
    top: setupGroupTopInput.value || null,
    bottom: setupGroupBottomInput.value || null,
  }

  if (formatterInput.value.length) {
    const func = new Function('item', `return ${formatterInput.value}`);
    window.__sorterFormatter = func;
  }

  hide(setupStep);
  show(sortingStep);
  setupSortingStep();
}

const sortingButtons = {
  left: document.getElementById(`sort-step__button_left`),
  right: document.getElementById(`sort-step__button_right`),
  top: document.getElementById(`sort-step__button_top`),
  bottom: document.getElementById(`sort-step__button_bottom`),
}

const currentSortValue = document.getElementById('sort-step-value');

function putCurrentItemTo(groupName) {
  result[groupName].push(data[currentItemIndex]);
  nextItem();
}

function onSortingKeyDown(e) {
  if (!(e.key in keyToGroupMap)) return;

  putCurrentItemTo(groupNames[keyToGroupMap[e.key]]);
}

currentSortValue.addEventListener('focusin', function () {
  currentSortValue.addEventListener('keydown', onSortingKeyDown)
})

currentSortValue.addEventListener('focusout', function () {
  currentSortValue.removeEventListener('keydown', onSortingKeyDown)
})

function setupSortingStep() {
  for (const [groupKey, groupName] of Object.entries(groupNames)) {
    if (groupName === null) continue;

    sortingButtons[groupKey].innerText = groupName;
    result[groupName] = [];
    show(sortingButtons[groupKey]);
  }

  currentSortValue.innerText = formatItem(data[currentItemIndex]);
}

function formatItem(item) {
  if (window.__sorterFormatter) return window.__sorterFormatter(item);

  return JSON.stringify(item, null, 2);
}

function nextItem() {
  currentItemIndex += 1;

  if (currentItemIndex >= data.length) {
    goToResultStep();
    currentSortValue.innerText = 'Готово';
    Object.values(sortingButtons).forEach(hide);
    return;
  }

  console.log(
    currentItemIndex,
    'items done.',
    'Overall result:',
    result,
    'Unsorted:',
    data.slice(currentItemIndex)
  );
  currentSortValue.innerText = formatItem(data[currentItemIndex]);
}

function goToResultStep() {
  hide(sortingStep);
  show(resultStep);
  console.log('Sorting result:')
  console.log(result)
}
