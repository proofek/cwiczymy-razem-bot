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

module.exports.getStatValueFromArgs = getStatValueFromArgs;