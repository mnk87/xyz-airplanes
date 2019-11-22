$(document).ready( () => {
  const columns = [
    { title: "ID", data: "id"},
    { title: "Registration Number", data: "regnr"},
    { title: "Current fuel level", data: "fuel"},
    { title: "Current Location", data: "name"},
    { title: "edit/delete",
        "render": (data, type, row, meta) => {
          let edString = `<button type="button" class="btn btn-danger"onclick="removeAirplane(${row.id});">remove</button>`;
          edString += ` <button type="button" class="btn btn-secondary"onclick="editAirplane(${row.id});">edit</button>`;
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
    console.log('no regnr');
    $("#regNrInput").popover({
      html: true,
      content: "please fill out this field",
      animation: true,
      placement: "right"

    })
    $('#regNrInput').popover('show');
  }
  if(!fuel){
    console.log('no fuel');
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
    }


  }
}
