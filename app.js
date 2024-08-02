const submitButton = document.querySelector('.submitbutton')
const emailHeaderInput = document.querySelector('#emailheader')
const summaryFromAddress = document.querySelector('.summary-from-address')
const summaryFromName = document.querySelector('.summary-from-name')
const summaryToAddress = document.querySelector('.summary-to-address')
const summaryToName = document.querySelector('.summary-to-name')
const summarySubject = document.querySelector('.summary-subject')
const summaryDate = document.querySelector('.summary-date')
const summaryTime = document.querySelector('.summary-time')
const summaryMessageId = document.querySelector('.summary-messageId')
const summaryReturnPath = document.querySelector('.summary-return-path')
import PostalMime from './node_modules/postal-mime/src/postal-mime.js';

function getPosition(string, subString, index) {
  return string.split(subString, index).join(subString).length;
}

 submitButton.onclick = async () => {
  const Headers = emailHeaderInput.value
  const email = await PostalMime.parse(Headers)
  console.log(email);
  let ReceivedHeaders = [];
  let ReceivedFromHeaders = [];
  let ReceivedByHeaders = [];
  let ReceivedWithHeaders = [];
  let ReceivedTimeHeaders = [];
  let AuthenticationResultHeader;
  let AuthenticationResultOriginalHeader;
  let DkimSignature;
  let Summary = {
    from:  email.from,
    date: email.date,
    message_id: email.messageId,
    subject: email.subject,
    to: email.to,
    return_path: email.returnPath
  }
  
  for (let i = 0; i < email.headers.length; i++) {
    switch (email.headers[i].key) {
      case "received":
        ReceivedHeaders.push(email.headers[i].value)
        break;
      case "authentication-results":
        AuthenticationResultHeader = email.headers[i].value
        break;
      case "authentication-results-original":
        AuthenticationResultOriginalHeader = email.headers[i].value
        break;
      case "dkim-signature":
        DkimSignature = email.headers[i].value
        break;
      
    }
  }

  for(let i=0; i<ReceivedHeaders.length; i++) {
    if (ReceivedHeaders[i].indexOf('from') === -1) {
      break;
    }
    let fromDomain = ReceivedHeaders[i].substring(ReceivedHeaders.indexOf('from')+6, getPosition(ReceivedHeaders[i], ' ', 2))
    ReceivedFromHeaders.push(fromDomain)
  }
  for(let i=0; i<ReceivedHeaders.length; i++) {
    if (ReceivedHeaders[i].indexOf('by') === -1) {
      break;
    }
    let ReceivedByHeadersUnfinished = ReceivedHeaders[i].substring(ReceivedHeaders[i].indexOf('by'), ReceivedHeaders[i].length);

    
    let byDomain = ReceivedByHeadersUnfinished.substring(ReceivedByHeadersUnfinished.indexOf('by')+3, getPosition(ReceivedByHeadersUnfinished, ' ', 2));
    ReceivedByHeaders.push(byDomain);
  }

  for(let i=0; i<ReceivedHeaders.length; i++) {
    if (ReceivedHeaders[i].indexOf('with') === -1) {
      break;
    }
    let ReceivedWithHeadersUnfinished = ReceivedHeaders[i].substring(ReceivedHeaders[i].indexOf('with'), ReceivedHeaders[i].length);
    let withProtocol;
    if(ReceivedWithHeadersUnfinished.includes(' SMTP ')) {
      withProtocol = 'SMTP'
    } else if (ReceivedWithHeadersUnfinished.includes(' ESMTPS ')) {
      withProtocol = 'ESMTPS'
    } else if (ReceivedWithHeadersUnfinished.includes(' ESMTP ')) {
      withProtocol = 'ESMTP'
    } else if (ReceivedWithHeadersUnfinished.includes(' HTTPS;') || ReceivedWithHeadersUnfinished.includes(' HTTPS ')) {
      withProtocol = 'HTTPS'
    } else if (ReceivedWithHeadersUnfinished.includes(' HTTP;') || ReceivedWithHeadersUnfinished.includes(' HTTP ')){
      withProtocol = 'HTTP'
    } else {
      withProtocol = 'OTHER'
    }
    ReceivedWithHeaders.push(withProtocol);
  }

  for(let i=0; i<ReceivedHeaders.length; i++) {
    if (ReceivedHeaders[i].indexOf(':') === -1) {
      break;
    }
    ReceivedTimeHeaders.push(ReceivedHeaders[i])
  }
  
  ReceivedFromHeaders = ReceivedFromHeaders.reverse()
  ReceivedByHeaders = ReceivedByHeaders.reverse()
  ReceivedWithHeaders = ReceivedWithHeaders.reverse()
  console.log(ReceivedFromHeaders)
  console.log(ReceivedByHeaders)
  console.log(ReceivedWithHeaders)
  summaryFromAddress.innerHTML = Summary.from.address
  summaryFromName.innerHTML = Summary.from.name
  summaryToAddress.innerHTML = Summary.to[0].address
  summaryToName.innerHTML = Summary.to[0].name
  summarySubject.innerHTML = Summary.subject
  let dateFunction = new Date(Summary.date);
  let year = dateFunction.getFullYear();
  let month = dateFunction.getMonth();
  let date = dateFunction.getDate();
  let hour = dateFunction.getHours();
  let min = dateFunction.getMinutes();
  let sec = dateFunction.getSeconds();
  if (hour < 10) { hour = '0' + hour.toString() }
  if (min < 10) { min = '0' + min.toString() }
  if (sec < 10) { sec = '0' + sec.toString() }
  summaryDate.innerHTML = dateFunction.toDateString() + ` ${date}/${month}/${year}`
  summaryTime.innerHTML = `${hour}:${min}:${sec}`
  summaryMessageId.textContent = Summary.message_id
  summaryReturnPath.innerHTML = Summary.return_path
}


