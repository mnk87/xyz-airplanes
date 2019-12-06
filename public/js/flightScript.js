$(document).ready( () => {
  const columns = [
    { title: "ID", data: "id"},
    { title: "Registration Number", data: "regnr"},
    { title: "Current fuel level", data: "fuel"},
    { title: "Current Location", data: "name"},
    { title: "Refuel",
        "render": (data, type, row, meta) => {
          return `<button type="button" class="btn btn-warning" onclick="refuelAirplane(${row.id});">refuel</button>`;
        }
    }
  ];
  let airplaneTable = $('#airplaneTable').DataTable({ columns: columns, select: { style: 'single'} });

  airplaneTable.on( 'select', ( e, dt, type, indexes ) => {
    const rowData = airplaneTable.rows(indexes).data().toArray()[0];
    selectAirplane(rowData);
  });

  airplaneTable.on( 'deselect', ( e, dt, type, indexes ) => {
    selectAirplane();
  });
  getLocations();
});

function getLocations() {
  const url = '/api/airfield';
  const xhttp = new XMLHttpRequest();
  xhttp.open('GET', url);
  xhttp.send();
  xhttp.onreadystatechange = () => {
    if (xhttp.readyState === 4 && xhttp.status === 200) {
      const data = JSON.parse(xhttp.responseText);
      fillStartingSelect(data);
      fillEndingSelect(data);
    }
  }
}

function fillStartingSelect(data) {
  let selectNode = document.getElementById('startingLocationSelect');
  for(let record of data) {
    let optionNode = document.createElement('option');
    optionNode.value = record.id;
    optionNode.appendChild(document.createTextNode(record.name));
    selectNode.appendChild(optionNode);
  }
}

function fillEndingSelect(data) {
  let selectNode = document.getElementById('endingLocationSelect');
  for(let record of data) {
    let optionNode = document.createElement('option');
    optionNode.value = record.id;
    optionNode.appendChild(document.createTextNode(record.name));
    selectNode.appendChild(optionNode);
  }
}

function getAirplaneData() {
  const location = document.getElementById('startingLocationSelect').value;
  const url = '/api/availableplanes/' + location;
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
}

function selectAirplane(data) {
  let span = document.getElementById('airplaneSpan');
  if(data){
    span.dataset.id = data.id;
    span.dataset.fuel = data.fuel;
  }
  else{
    delete span.dataset.id;
    delete span.dataset.fuel;
  }
}

function startFlight() {
  let startingLocation = document.getElementById('startingLocationSelect').value;
  let airplane = document.getElementById('airplaneSpan').dataset.id;
  let fuel = +document.getElementById('airplaneSpan').dataset.fuel;
  let endingLocation = document.getElementById('endingLocationSelect').value;
  if(!startingLocation){
    showErrorModal('no starting location','Please select a starting location');
    return;
  }
  if(!airplane){
    showErrorModal('no airplane selected','Please select an airplane to fly with');
    return;
  }
  if(fuel < 2000){
    showErrorModal('pruttel','please refuel this airplane before taking off, or else');
    return;
  }
  if(!endingLocation){
    showErrorModal('no destination','please select a destination for this flight');
    return;
  }
  if(startingLocation === endingLocation){
    showErrorModal('wtf','you\'re trying to fly to the same airport you retard');
    return;
  }
  const jsonObject = {
    airplane_id: airplane,
    from_location: startingLocation,
    to_location: endingLocation
  }
  const url = "/api/flighteasy";
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", url);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify(jsonObject));
  xhttp.onreadystatechange = () => {
    if(xhttp.readyState === 4 && xhttp.status === 200){
      getAirplaneData();
      showSuccess();
    }
  }
  // console.log(jsonObject);
}

function showErrorModal(title, errorText){
  document.getElementById('errorModalTitle').innerText = title;
  document.getElementById('modalErrorText').innerText = errorText;
  $('#errorModal').modal('show');
}

function showSuccess(){
  console.log('gelukt');
}

function refuelAirplane(idToRefuel) {
  const id = idToRefuel;
  const url = '/api/airplane/refuel/' + id;
  const xhttp = new XMLHttpRequest();
  xhttp.open('PUT', url);
  xhttp.send();
  xhttp.onreadystatechange = () => {
    if (xhttp.readyState === 4 && xhttp.status === 200) {
      getAirplaneData();
    }
  }
}
