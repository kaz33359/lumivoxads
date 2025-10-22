function contact() {
  let name = document.getElementById("first_name").value;
  let email = document.getElementById("email").value;
  let mobile = document.getElementById("mobile").value;
  let message = document.getElementById("message").value;

  let contact = `${name}, ${email}, ${mobile}, ${message}`;

  // alert(contact);

  let url = `https://wa.me/919746583440?text=${contact}`;
  window.open(url);
}
