const submitButton = document.querySelector('.submitbutton')
const emailHeaderInput = document.querySelector('#emailheader')
const summaryFromAddress = document.querySelector('.summary-from-address')
const summaryFromName = document.querySelector('.summary-from-name')
const summaryToddress = document.querySelector('.summary-to-address')
const summaryToName = document.querySelector('.summary-to-name')
// import { addressParser } from "postal-mime";


// function getIndicesOf(searchStr, str, caseSensitive) {
//   var searchStrLen = searchStr.length;
//   if (searchStrLen == 0) {
//       return [];
//   }
//   var startIndex = 0, index, indices = [];
//   if (!caseSensitive) {
//       str = str.toLowerCase();
//       searchStr = searchStr.toLowerCase();
//   }
//   while ((index = str.indexOf(searchStr, startIndex)) > -1) {
//       indices.push(index);
//       startIndex = index + searchStrLen;
//   }
//   return indices;
// }

// function grabFrom(header) {
//   let fromHeaders = [];
//   let receivedFromIndices = getIndicesOf('Received:from', header, true)
//   let spaceIndices = getIndicesOf(' ', header, false)
//   console.log(spaceIndices)
//   for(let j = 0; j < receivedFromIndices.length; j++) {
//     for(let i = 0; i < spaceIndices.length; i++) {
//       let secondSpace = 0;
//       if (spaceIndices[i] < receivedFromIndices[j]) {
//         spaceIndices.splice(i, 1)
//       } else if (spaceIndices[i] > receivedFromIndices[j]) {
//         secondSpace++;
//         if (secondSpace === 2) {
//           return;
//         } else {
//           spaceIndices.splice(i, 1);
//         }
//       }
//       console.log(spaceIndices)
//     }
//   }
  
//   for (let i = 0; i < receivedFromIndices.length; i++) {
//     fromHeaders.push(header.substring(receivedFromIndices[i], spaceIndices[i + 1]))
//     console.log(receivedFromIndices)
//     console.log(spaceIndices)
//     console.log(header)
//   }

  

//   return fromHeaders
// }

 submitButton.onclick = async () => {
  const Headers = emailHeaderInput.value
  const email = await PostalMime.parse(Headers)
  console.log(email);
  let ReceivedHeaders = [];
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
  summaryFromAddress.innerHTML = Summary.from.address
  summaryFromName.innerHTML = Summary.from.name
  summaryToAddress.innerHTML = Summary.to.address
  summaryToName.innerHTML = Summary.to.name
  console.log(Summary)
  console.log(ReceivedHeaders)
}
import PostalMime from './node_modules/postal-mime/src/postal-mime.js';

