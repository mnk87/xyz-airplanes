$(document).ready( () => {
  const columns = [
    { title: "ID", data: "id"},
    { title: "Registration Number", data: "regnr"},
    { title: "Current fuel level", data: "fuel"},
    { title: "Current Location", data: "name"},
    { title: "edit/delete",
        "render": (data, type, row, meta) => {
          let edString = `<button type="button" class="btn btn-danger"onclick="showRemoveAirplane(${row.id});">remove</button>`;
          edString += ` <button type="button" class="btn btn-secondary"onclick="showEditAirplane(${row.id});">edit</button>`;
          return edString;
        }
    }
  ];
  let airplaneTable = $('#airplaneTable').DataTable({ columns: columns });
  getAirplaneData();
  getLocations();
}); // end of document.ready

function getAirplaneData() {
  const url = '/api/airplane2';
  const xhttp = new XMLHttpRequest();
  xhttp.open('GET', url);
  xhttp.send();
  xhttp.onreadystatechange = () => {
    if (xhttp.readyState === 4 && xhttp.status === 200) {
      const data = JSON.parse(xhttp.responseText);
      if (data) {
        $("#airplaneTable").DataTable().clear();
        $("#airplaneTable").DataTable().rows.add(data);
        $("#airplaneTable").DataTable().columns.adjust().draw();
      }
    }
  }
} //end of function getAirplaneData

function getLocations() {
  const url = '/api/airfield';
  const xhttp = new XMLHttpRequest();
  xhttp.open('GET', url);
  xhttp.send();
  xhttp.onreadystatechange = () => {
    if (xhttp.readyState === 4 && xhttp.status === 200) {
      const data = JSON.parse(xhttp.responseText);
      fillCreateSelect(data);
    }
  }
}

function fillCreateSelect(data) {
  for(let record of data) {
    let selectNode = document.getElementById('locationSelect');
    let optionNode = document.createElement('option');
    optionNode.value = record.id;
    optionNode.appendChild(document.createTextNode(record.name));
    selectNode.appendChild(optionNode);
  }
}

function createAirplane() {
  let regNr = document.getElementById('regNrInput').value;
  let fuel = document.getElementById('fuelInput').value;
  let location = document.getElementById('locationSelect').value;
  if(!regNr){
    //console.log('no regnr');
    $("#regNrInput").popover({
      html: true,
      content: "please fill out this field",
      animation: true,
      placement: "right"

    })
    $('#regNrInput').popover('show');
  }
  if(!fuel){
    //console.log('no fuel');
    $("#fuelInput").popover({
      html: true,
      content: "please fill out this field",
      animation: true,
      placement: "right"

    })
    $('#fuelInput').popover('show');
  }
  if(fuel){
    const pattern = /^\d{1,4}$/
    if(pattern.test(fuel)){
      if(fuel > 5000){
        $("#fuelInput").popover({
          html: true,
          content: "please fill in a value between 0-5000",
          animation: true,
          placement: "right"

        });
        $('#fuelInput').popover('show');
        return;
      }
    }
    if(!pattern.test(fuel)){
      $("#fuelInput").popover({
        html: true,
        content: "please fill in a value between 0-5000",
        animation: true,
        placement: "right"

      })
      $('#fuelInput').popover('show');
      return;
    }
  }
  if(regNr && fuel && location){
    const jsonObject = {
      regnr: regNr,
      fuel: fuel,
      location: location
    }
    const url = "/api/airplane";
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", url);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(jsonObject));
    xhttp.onreadystatechange = () => {
      if(xhttp.readyState === 4 && xhttp.status === 200){
        getAirplaneData();
      }
      if(xhttp.readyState === 4 && xhttp.status === 403){
        showErrorModal('something went wrong...', xhttp.responseText);
      }
    }
  }
} // end of function createAirplane()


function showErrorModal(title, errorText){
  document.getElementById('errorModalTitle').innerText = title;
  document.getElementById('modalErrorText').innerText = errorText;
  $('#errorModal').modal('show');
}

function hidePopover(inputid) {
  $(`#${inputid}`).popover('dispose');
}

function showRemoveAirplane(idToRemove) {
  const id = idToRemove;
  let span = document.getElementById('removeModalIdSpan')
  span.innerText = id;
  span.dataset.id = id;
  $('#removeModal').modal('show');
}

function removeAirplane(){
  const id = document.getElementById('removeModalIdSpan').dataset.id;
  const url =  "/api/airplane/"+ id;
  const xhttp = new XMLHttpRequest();
  xhttp.open('DELETE', url);
  xhttp.send();
  xhttp.onreadystatechange = () => {
    if (xhttp.readyState === 4 && xhttp.status === 204) {
      $('#removeModal').modal('hide');
      getAirplaneData();
    }
  }
}

function showEditAirplane(idToEdit) {
  const id = idToEdit;
  document.getElementById('editModalId').value = id;
  const url = "/api/airplane/" + id;
  const xhttp = new XMLHttpRequest();
  xhttp.open('GET', url);
  xhttp.send();
  xhttp.onreadystatechange = () => {
    if (xhttp.readyState === 4 && xhttp.status === 200){
      const data = JSON.parse(xhttp.responseText);
      fillEditModal(data);
    }
  }
}

function fillEditModal(data) {
  document.getElementById('editModalIdSpan').innerText = data.id;
  document.getElementById('editModalRegNr').value = data.regnr;
  document.getElementById('editModalRegNrInput').value = data.regnr;
  document.getElementById('editModalFuelInput').value = data.fuel;
  const url = '/api/airfield';
  const xhttp = new XMLHttpRequest();
  xhttp.open('GET', url);
  xhttp.send();
  xhttp.onreadystatechange = () => {
    if (xhttp.readyState === 4 && xhttp.status === 200) {
      const data1 = JSON.parse(xhttp.responseText);
      let editModalSelect = document.getElementById('editModalLocationSelect');
      let editModalSelectCurrent = document.getElementById('editModalCurrentLocation');
      let editModalLocations = document.getElementById('editModalLocations');
      editModalLocations.innerHTML = '';
      editModalSelectCurrent.innerHTML = '';
      for(let record of data1){
        if(record.id === data.location){
          let currentOption = document.createElement('option');
          currentOption.value = data.location;
          currentOption.appendChild(document.createTextNode(record.name));
          editModalCurrentLocation.appendChild(currentOption);
        }
        let option = document.createElement('option');
        option.value = record.id;
        option.appendChild(document.createTextNode(record.name));
        editModalLocations.appendChild(option);
      }
      editModalSelect.selectedIndex = 0;
      $('#editModal').modal('show');
    }
  }
}

function editAirplane() {
  let regNr = document.getElementById('editModalRegNrInput').value;
  let storedRegNr = document.getElementById('editModalRegNr').value;
  let fuel = document.getElementById('editModalFuelInput').value;
  if(!regNr){
    $("#editModalRegNrInput").popover({
      html: true,
      content: "please fill out this field",
      animation: true,
      placement: "top"

    });
    $('#editModalRegNrInput').popover('show');
  }
  if(!fuel){
    //console.log('no fuel');
    $("#editModalFuelInput").popover({
      html: true,
      content: "please fill out this field",
      animation: true,
      placement: "top"

    })
    $('#editModalFuelInput').popover('show');
  }
  if(fuel){
    const pattern = /^\d{1,4}$/
    if(pattern.test(fuel)){
      if(fuel > 5000){
        $("#editModalFuelInput").popover({
          html: true,
          content: "please fill in a value between 0-5000",
          animation: true,
          placement: "top"

        });
        $('#editModalFuelInput').popover('show');
        return;
      }
    }
    if(!pattern.test(fuel)){
      $("#editModalFuelInput").popover({
        html: true,
        content: "please fill in a value between 0-5000",
        animation: true,
        placement: "top"

      })
      $('#editModalFuelInput').popover('show');
      return;
    }
  }
  if(fuel && regNr){
    let location = document.getElementById('editModalLocationSelect').value;
    const jsonObject = {
      regnr: regNr,
      fuel: fuel,
      location: location
    }
    const id = document.getElementById('editModalId').value;
    const url = '/api/airplane/' + id;
    const xhttp = new XMLHttpRequest();
    xhttp.open("PUT", url);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(jsonObject));

    xhttp.onreadystatechange = () => {
      if(xhttp.readyState === 4 && xhttp.status === 200){
        $('#editModal').modal('hide');
        getAirplaneData();
      }
      if(xhttp.readyState === 4 && xhttp.status === 403){
        $("#editModalRegNrInput").popover({
          html: true,
          content: "this registration number already exists in another record!",
          animation: true,
          placement: "top"
        });
        $('#editModalRegNrInput').popover('show');
      }
    }
  }
} // end of function editAirplane()
