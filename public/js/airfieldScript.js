$(document).ready( () => {
  const columns = [
    { title: "ID", data: "id"},
    { title: "Name", data: "name"},
    { title: "edit/delete",
        "render": (data, type, row, meta) => {
          let edString = `<button type="button" class="btn btn-danger"onclick="showRemoveAirfield(${row.id});">remove</button>`;
          edString += ` <button type="button" class="btn btn-secondary"onclick="showEditAirfield(${row.id});">edit</button>`;
          return edString;
        }
    }
  ];
  let airfieldTable = $('#airfieldTable').DataTable({ columns: columns });
  getAirfieldData();
});

function getAirfieldData() {
  const url = '/api/airfield';
  const xhttp = new XMLHttpRequest();
  xhttp.open('GET', url);
  xhttp.send();
  xhttp.onreadystatechange = () => {
    if (xhttp.readyState === 4 && xhttp.status === 200) {
      const data = JSON.parse(xhttp.responseText);
      if (data) {
        $("#airfieldTable").DataTable().clear();
        $("#airfieldTable").DataTable().rows.add(data);
        $("#airfieldTable").DataTable().columns.adjust().draw();
      }
    }
  }
}

function createAirfield() {
  let name = document.getElementById('nameInput').value;
  if(!name){
    $("#nameInput").popover({
      html: true,
      content: "please fill out this field",
      animation: true,
      placement: "right"

    });
    $('#nameInput').popover('show');
    return;
  }
  const jsonObject = { name: name };
  const url = "/api/airfield";
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", url);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify(jsonObject));
  xhttp.onreadystatechange = () => {
    if(xhttp.readyState === 4 && xhttp.status === 200){
      getAirfieldData();
    }
  }
}

function showRemoveAirfield(idToRemove) {
  const id = idToRemove;
  let span = document.getElementById('removeModalIdSpan')
  span.innerText = id;
  span.dataset.id = id;
  $('#removeModal').modal('show');
}

function removeAirfield() {
  const id = document.getElementById('removeModalIdSpan').dataset.id;
  const url =  "/api/airfield/"+ id;
  const xhttp = new XMLHttpRequest();
  xhttp.open('DELETE', url);
  xhttp.send();
  xhttp.onreadystatechange = () => {
    if(xhttp.readyState === 4 && xhttp.status === 204) {
      $('#removeModal').modal('hide');
      getAirfieldData();
    }
    if(xhttp.readyState === 4 && xhttp.status === 403) {
      $('#removeModal').modal('hide');
      showErrorModal('gaat nie...','there are still airplanes on this airfield, fly them elsewhere before removing this airfield')
    }
  }
}

function showErrorModal(title, errorText){
  document.getElementById('errorModalTitle').innerText = title;
  document.getElementById('modalErrorText').innerText = errorText;
  $('#errorModal').modal('show');
}

function showEditAirfield(idToEdit) {
  const id = idToEdit;
  const url = "/api/airfield/" + id;
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
  document.getElementById('editModalId').value = data.id;
  document.getElementById('editModalNameInput').value = data.name;
  $('#editModal').modal('show');
}

function editAirfield() {
  const id = document.getElementById('editModalId').value;
  const name = document.getElementById('editModalNameInput').value;
  const jsonObject = {
    name: name
  }
  const url = '/api/airfield/' + id;
  const xhttp = new XMLHttpRequest();
  xhttp.open("PUT", url);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify(jsonObject));

  xhttp.onreadystatechange = () => {
    if(xhttp.readyState === 4 && xhttp.status === 200){
      $('#editModal').modal('hide');
      getAirfieldData();
    }
  }
}

function hidePopover(inputid) {
  $(`#${inputid}`).popover('dispose');
}
