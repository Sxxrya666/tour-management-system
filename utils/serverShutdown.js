var i = 5;

function startTimer() {
  var countdownTimer = setInterval(function() {
    // Clear the previous line
    process.stdout.write('\r');
    // Print the updated value as a string
    process.stdout.write(i.toString());
    i--;

    if (i <= 0) {
      clearInterval(countdownTimer);
    }
  }, 1000);
}


module.exports = startTimer
