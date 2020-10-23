function getStatValueFromArgs(reportArgs, statName, asNumber = false)
{
    var argObj = reportArgs.filter(arg => {
      return arg.name === statName
    })
    
    if (Array.isArray(argObj) && argObj.length > 0) {
      return (asNumber === true) ? argObj[0].decValue : argObj[0].value;
    } else {
      return 0;
    }
}

function getLastMonday() {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() ));
  const todayDay = today.getDay();
  let lastMonday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() ));
  if (todayDay == 0) {
    lastMonday.setDate(today.getDate() - 6);
  } else {
    lastMonday.setDate(today.getDate() - (todayDay - 1));
  }

  return lastMonday;
}

module.exports.getStatValueFromArgs = getStatValueFromArgs;
module.exports.getLastMonday = getLastMonday;