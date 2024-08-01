const submitButton = document.querySelector('.submitbutton')
const emailHeaderInput = document.querySelector('#emailheader')

submitButton.onclick = () => {
  const Headers = emailHeaderInput.value
  console.log(Headers)
  let fromHeaders = Headers.substring(
    Headers.indexOf("Received:from") + 1, 
    Headers.lastIndexOf(";")
  );
  
  console.log(fromHeaders)
}
