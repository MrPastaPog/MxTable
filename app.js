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
const SPFAuthentication = document.querySelector('.spf-auth')
const SPFAlignment = document.querySelector('.spf-align')
const DKIMAuthentication = document.querySelector('.dkim-auth')
const DKIMAlignment = document.querySelector('.dkim-align')
const SPFAuthenticationText = document.querySelector('.spf-auth-text')
const SPFAlignmentText = document.querySelector('.spf-align-text')
const DKIMAuthenticationText = document.querySelector('.dkim-auth-text')
const DKIMAlignmentText = document.querySelector('.dkim-align-text')
const table = document.querySelector('.table')
import PostalMime from './node_modules/postal-mime/src/postal-mime.js';
import  PowerShell from 'node-powershell';

const ps = new Shell({
  executionPolicy: 'Bypass',
  noProfile: true
});


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
  
  table.innerHTML = `<tr>
        <th>Hop</th>
        <th>From</th>
        <th>By</th>
        <th>With</th>
        <th>Time (UTC)</th>
      </tr>`

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
    if (ReceivedHeaders[i].substring().lastIndexOf(':') === -1) {
      break;
    }
    
    let ReceivedTimeHeadersNotUTC = ReceivedHeaders[i].substring(ReceivedHeaders[i].lastIndexOf(':') - 5, ReceivedHeaders[i].lastIndexOf(':') + 3)

    //convert to UTC
    let lastMinus = ReceivedHeaders[i].lastIndexOf('-')
    let lastAdd = ReceivedHeaders[i].lastIndexOf('+')
    let timeZoneIndex = lastMinus > lastAdd ? lastMinus : lastAdd

    if (ReceivedHeaders[i].substring(timeZoneIndex, timeZoneIndex+5) !== '+0000') {
      console.log(ReceivedHeaders[i].substring(timeZoneIndex, timeZoneIndex+5))

      let hour = Number(ReceivedTimeHeadersNotUTC.substring(0, 2));
      let min = Number(ReceivedTimeHeadersNotUTC.substring(3, 5));
      let timeZoneHour;
      let timeZoneMin;

      if (ReceivedHeaders[i].charAt(timeZoneIndex) === '+') {
        //subtract

        timeZoneHour = -Number(ReceivedHeaders[i].substring(timeZoneIndex + 1, timeZoneIndex + 3));
        timeZoneMin = -Number(ReceivedHeaders[i].substring(timeZoneIndex + 3, timeZoneIndex + 5))
        console.log(timeZoneHour)
        console.log(timeZoneMin)
      } else if (ReceivedHeaders[i].charAt(timeZoneIndex) === '-') {
        //add
        timeZoneHour = Number(ReceivedHeaders[i].substring(timeZoneIndex + 1, timeZoneIndex + 3));
        timeZoneMin = Number(ReceivedHeaders[i].substring(timeZoneIndex + 3, timeZoneIndex + 5))
        console.log(timeZoneHour)
        console.log(timeZoneMin)
      }
      console.log(hour)
      let newHour = hour + timeZoneHour
      let newMin = min + timeZoneMin
      console.log(newHour)
      if (newHour > 24) {
        newHour = newHour % 24
      }
      if (newMin > 60) {
        newMin = newMin % 24
      }
      if (newHour < 10) {
        newHour = '0' + newHour.toString() 
      }
      if (newMin < 10) {
        newMin = '0' + newMin.toString() 
      }
      console.log(ReceivedTimeHeadersNotUTC)
      ReceivedTimeHeaders.push(`${newHour}:${newMin}:${ReceivedTimeHeadersNotUTC.substring(6, 8)}`)
    } else {
      ReceivedTimeHeaders.push(ReceivedTimeHeadersNotUTC)
    }
  }
  
  ReceivedFromHeaders = ReceivedFromHeaders.reverse()
  ReceivedFromHeaders.unshift(' ');
  ReceivedByHeaders = ReceivedByHeaders.reverse()
  ReceivedWithHeaders = ReceivedWithHeaders.reverse()
  ReceivedTimeHeaders = ReceivedTimeHeaders.reverse()
  
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
  

  let ReceivedHeadersFirstDomain = ReceivedHeaders[ReceivedHeaders.length-1].substring(ReceivedHeaders[ReceivedHeaders.length-1].indexOf(' ') + 1, getPosition(ReceivedHeaders[ReceivedHeaders.length-1], ' ', 2))
  console.log(PowerShell.$`resolve-dnsname ${ReceivedHeadersFirstDomain}`)
  console.log(email.headers.indexOf({key: "authentication-results-original"}))
  SPFAlignment.style.backgroundColor = 'red';
  SPFAlignmentText.textContent = 'false';
  if (AuthenticationResultOriginalHeader !== undefined) {
    if (!AuthenticationResultOriginalHeader.includes('spf=pass')) return;
    SPFAlignment.style.backgroundColor = 'green';
    SPFAlignmentText.textContent = 'true';
  } 
  

  for (let i = 0; i < ReceivedHeaders.length; i++) {

      table.innerHTML += `<tr>
    <th>${i+1}</th>
    <th>${ReceivedFromHeaders[i]}</th>
    <th>${ReceivedByHeaders[i]}</th>
    <th>${ReceivedWithHeaders[i]}</th>
    <th>${ReceivedTimeHeaders[i]}</th>
  </tr>`
  }
  
}


