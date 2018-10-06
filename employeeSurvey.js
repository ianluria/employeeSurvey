//finish functional programming lessons
//clean css

const panelObjectList = createPanelObjects();

panelObjectList.forEach(thisPanelObject => {

  let isFinalPanel = false;
  if (panelObjectList.indexOf(thisPanelObject) === panelObjectList.length - 1) {
    isFinalPanel = true;
  }

  buttonCreator(thisPanelObject, isFinalPanel);

  if (!isFinalPanel) {
    addProgressButtonEventListener(thisPanelObject, panelObjectList);
  } else if (isFinalPanel) {
    addSubmitButtonEventListener(thisPanelObject);
  }

  addCheckmarkListener(thisPanelObject, panelObjectList);

  insertPanelIntoDOM(thisPanelObject);

  thisPanelObject.getPanelElement().style.display = "none";

  visibilityChangeDetector(thisPanelObject, panelObjectList);

  requiredInputAlerter(thisPanelObject);
});


window.onresize = () => {

  changeMiniDivTextToMatchScreenSize(window.innerWidth);

};

//display the first panel to begin

panelObjectList[0].getPanelElement().style.display = "flex";


function buttonCreator(thisPanelObject, finalPanel) {
  const newButton = document.createElement("div");
  newButton.classList.add("buttonClass");
  const buttonText = document.createElement("p");
  let text = "";

  if (finalPanel) {
    newButton.classList.add("submitButton");
    text = "Submit";
  } else {
    newButton.classList.add("progressButton");
    text = "Next Page";
  }

  buttonText.appendChild(document.createTextNode(text));
  newButton.appendChild(buttonText);

  thisPanelObject.setButtonElement(newButton);
}

function addProgressButtonEventListener(panelObject, panelList) {
  panelObject.getButtonElement().addEventListener("click", function (event) {
    const parentPanelObject = getParentPanelObjectFromEvent(event, panelList);

    parentPanelObject.getPanelElement().style.display = "none";

    advanceToNextPanel(parentPanelObject, panelList);
  });
}

function advanceToNextPanel(thisPanelObject, panelList) {
  if (thisPanelObject.getIdNumber() < panelList.length) {
    const nextPanelInStack = panelList[thisPanelObject.getIdNumber()];

    nextPanelInStack.getPanelElement().style.display = "flex";
  }
}

function addSubmitButtonEventListener(thisPanelObject) {
  thisPanelObject.getButtonElement().addEventListener("click", event => {
    if (!document.getElementById("submittedDisplay")) {
      const submittedDiv = document.createElement("div");

      submittedDiv.id = "submittedDisplay";

      const submittedText = document.createElement("p");
      submittedText.innerText = "Survey Completed.";

      const checkIcon = document.createElement("i");
      checkIcon.className = "far fa-check-circle fa-5x";

      submittedDiv.appendChild(submittedText);
      submittedDiv.appendChild(checkIcon);

      document.body.appendChild(submittedDiv);

      addBodyClickEventListener(thisPanelObject);
    }
    document.getElementById("submittedDisplay").style.display = "flex";
  });
}

function addBodyClickEventListener(panelObject) {

  document.body.addEventListener("click", bodyEvent => {

    //do nothing if user clicks on a submit button
    if (
      !testEventPathForElement(bodyEvent.target, panelObject.getButtonElement())
    ) {
      const submittedDiv = document.getElementById("submittedDisplay");

      submittedDiv.style.display = "none";
    }
  });
}

function testEventPathForElement(eventTarget, element) {
  while (eventTarget != null) {

    if (eventTarget === element) {
      return true;
    }

    eventTarget = eventTarget.parentNode;
  }
  return false;
}

function addCheckmarkListener(thisPanelObject, panelList) {
  thisPanelObject.getButtonElement().addEventListener("click", event => {
    const parentPanelObject = getParentPanelObjectFromEvent(event, panelList);

    [...parentPanelObject.getMiniPanelElement().children].forEach(child => {

      if (!child.innerText.includes(String.fromCharCode(10004))) {
        child.innerText = child.innerText + "  " + String.fromCharCode(10004);
      }
    });
  });
}

function getParentPanelObjectFromEvent(event, panelList) {

  let parentNode = event.target.parentNode;

  while (parentNode.className != "panel") {

    parentNode = parentNode.parentNode;

    if (parentNode == null) {
      throw "Cannot find a parent node";
    }
  }

  return panelList.find(panelObject => panelObject.getPanelElement() === parentNode);
}

function insertPanelIntoDOM(thisPanelObject) {
  const panelForInsertion = convertHTMLToDOMElement(thisPanelObject.getHTML());

  thisPanelObject.setPanelElement(panelForInsertion);

  thisPanelObject
    .getPanelElement()
    .appendChild(thisPanelObject.getButtonElement());

  document
    .getElementById("survey-form")
    .appendChild(thisPanelObject.getPanelElement());
}

//function that takes raw HTML and returns a DOM element object
//function creates an entirely new HTML page but returns only the first instance of an element with class of panel
function convertHTMLToDOMElement(html) {
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html").getElementsByClassName("panel")[0];
}

function visibilityChangeDetector(thisPanelObject, panelList) {
  const mutationObserver = new MutationObserver(mutationsList => {

    if (
      mutationsList[0].oldValue === "display: none;" &&
      mutationsList[0].target.style.display === "flex"
    ) {
      if (thisPanelObject.getMiniPanelElement() === undefined) {

        createNewMiniPanel(thisPanelObject);

        addMiniPanelToPage(thisPanelObject, panelList);

        changeMiniDivTextToMatchScreenSize(window.innerWidth);
      }
    }
  });

  mutationObserver.observe(thisPanelObject.getPanelElement(), {
    attributeOldValue: true
  });
}

function createNewMiniPanel(thisPanelObject) {
  const newMiniDiv = document.createElement("div");
  newMiniDiv.className = "minimizedPanel";
  newMiniDiv.id = "miniPage" + thisPanelObject.getIdNumber();

  const largeMiniDivText = document.createElement("p");

  largeMiniDivText.className = "largeScreenMiniDivText";

  largeMiniDivText.appendChild(
    document.createTextNode(
      "Page " + thisPanelObject.getIdNumber() + " Questions"
    )
  );

  newMiniDiv.appendChild(largeMiniDivText);

  const smallMiniDivText = document.createElement("p");

  smallMiniDivText.className = "smallScreenMiniDivText";

  smallMiniDivText.appendChild(
    document.createTextNode("Page " + thisPanelObject.getIdNumber())
  );

  newMiniDiv.appendChild(smallMiniDivText);

  thisPanelObject.setMiniPanelElement(newMiniDiv);
}

function addMiniPanelToPage(thisPanelObject, panelList) {
  const flexDivForMiniPanels = document.getElementById("flexDiv");

  flexDivForMiniPanels.appendChild(thisPanelObject.getMiniPanelElement());

  thisPanelObject.getMiniPanelElement().addEventListener("click", newEvent => {
    hideAllPanels(panelList);
    thisPanelObject.getPanelElement().style.display = "flex";
  });
}

function hideAllPanels(panelList) {
  panelList.forEach(panelObject => {
    if (panelObject.getPanelElement().style.display != "none") {
      panelObject.getPanelElement().style.display = "none";
    }
  });
}

function changeMiniDivTextToMatchScreenSize(size) {
  if (size < 500) {
    size = "small";
  } else {
    size = "large";
  }

  [...document.getElementById("flexDiv").children].forEach(miniDiv => {

    [...miniDiv.children].forEach(textChild => {

      if (textChild.className === size + "ScreenMiniDivText") {
        textChild.style.display = "block";
      } else {
        textChild.style.display = "none";
      }
    });
  });
}

function requiredInputAlerter(thisPanelObject) {

  const requiredInputs = thisPanelObject.getPanelElement().querySelectorAll(".requiredUserInput");

  [...requiredInputs].forEach(requiredInput => {

    requiredInput.onchange = (event) => {

      let addStatus, removeStatus;

      if (event.target.checkValidity()) {
        addStatus = "inputValid";
        removeStatus = "inputInvalid";
        if (requiredInput.id === "nameInput") nameInputErrorMessage(true);
      } else {
        addStatus = "inputInvalid";
        removeStatus = "inputValid";
        if (requiredInput.id === "nameInput") nameInputErrorMessage(false);

      }
      event.target.classList.add(addStatus);
      event.target.classList.remove(removeStatus)
    }

    
  });
}

function nameInputErrorMessage(valid){
if (valid){
document.getElementById("nameInput").setCustomValidity("");
} else {
document.getElementById("nameInput").setCustomValidity("Format: FIRST LAST(- LAST)");
}
}

function createPanelObjects() {
  const PanelObject = createPanelObject;

  const panel1 = new PanelObject(1);

  panel1.setHTML(`<div id="panel1" class="panel">

    <div class="description"><p><b>Welcome to the Ogden Mining Company.</b></p>
<p>We are excitied to have you as part of our team. We are growing rapidly to meet the global demand for salt.</p><p>Please take a moment to fill out your information.</p></div>

    <fieldset>
      <legend id="titleID">Personal Information</legend>
      <div class="fieldsetElement">
      <label for="name" id="name-label">Enter your full name: </label>
      <input type="text" id="nameInput" name="name" class="requiredUserInput" placeholder="first last" pattern="^[A-Za-z]+\\s[A-Za-z]+[\\s-]*[A-Za-z.]*$" required>
      </div>
<div class="fieldsetElement">
      <label for="email" id="email-label">Enter your email address: </label>
      <input type="email" id="emailInput" name="email" class="requiredUserInput" placeholder="name@youremail.com" required>
      </div>
<div class="fieldsetElement">
      <label for="number" id="number-label">Enter your new employee ID: </label>
      <input type="number" id="numberInput" min="1000" max="9999" class="requiredUserInput" name="IDnumber">
</div>
    </fieldset>
  </div>`);

  const panel2 = new PanelObject(2);

  panel2.setHTML(`<div id="panel2" class="panel">
    <fieldset>
      <legend>Training Background Information</legend>
<div class="fieldsetElement">
      <label for="experienceDropdown">Please select your level of experience within the mining industry:</label>
<br>
      <select id="experienceDropdown" name="experience" class="fieldsetElementJr">
      <option value="none">No Experience.  My first job in mining.</option>
      <option value="lessthanone">Less than one year.</option>
      <option value="oneyear">More than one year.</option>
      <option value="fiveyears">More than five years.</option>
    </select>
      </div>
<hr>
<div class="fieldsetElement">
      <label for="safety">Have you completed the OSHA Mine Safety 10 Hour training yet?</label>
      <br>
<div class="fieldsetElementJr">
      <input type="radio" name="safety" id="safety" value="yes">Yes<br>
      <input type="radio" name="safety" id="safety" value="no">No</div></div>

<hr>
<div class="fieldsetElement">
      <label for="training">Select any of the following training you have received:</label><br>
<div class="fieldsetElementJr">      
<input type="checkbox" id= "OMCTraining1" name="OMCTraining1" value="OMC1" class="trainingCheckbox"><label for="OMCTraining1">Ogden Mining Co.'s New Employee Orientation</label><br>
      <input type="checkbox" id="breathingTraining" name="breathingTraining" value="breathing" class="trainingCheckbox"><label for="breathingtraining">Breathing Protection Apparatus </label>
</div></div>
    </fieldset>
  </div>`);

  const panel3 = new PanelObject(3);

  panel3.setHTML(` <div id="panel3" class="panel">
    <fieldset>
      <legend>Optional Comments or Questions</legend>
<div class="fieldsetElement">
      <label for="comments">Enter here any questions or comments you have.</label>
      <br>
      <textarea name="comments" id="comments"></textarea>
</div>
    </fieldset>

  </div>`);

  return [panel1, panel2, panel3];
}

function createPanelObject(idNumber) {
  let html, buttonElement, miniPanelElement, panelElement;

  const idName = "panel" + idNumber;

  function setHTML(newHtml) {
    html = newHtml;
  }

  function getHTML() {
    return html;
  }

  function getIdNumber() {
    return idNumber;
  }

  function getIdName() {
    return idName;
  }

  function setButtonElement(newButtonElement) {
    buttonElement = newButtonElement;
  }

  function getButtonElement() {
    return buttonElement;
  }

  function setMiniPanelElement(newMiniPanelElement) {
    miniPanelElement = newMiniPanelElement;
  }

  function getMiniPanelElement() {
    return miniPanelElement;
  }

  function setPanelElement(newPanelElement) {
    panelElement = newPanelElement;
  }

  function getPanelElement() {
    return panelElement;
  }

  return {
    setHTML,
    getHTML,
    getIdNumber,
    getIdName,
    setButtonElement,
    getButtonElement,
    setMiniPanelElement,
    getMiniPanelElement,
    setPanelElement,
    getPanelElement
  };
}