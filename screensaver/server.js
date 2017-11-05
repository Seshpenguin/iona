/*
 * Iona Screensaver Daemon
 * 
 */

console.log("Starting iona screensaver daemon...")

const ioHook = require('iohook');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('test.sql');
const { exec } = require('child_process');

var islocked = false;
var lockCommand = "dm-tool lock";
var lockTime = 0;


db.serialize(function () {
    /*
    var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    for (var i = 0; i < 10; i++) {
        stmt.run("Ipsum " + i);
    }
    stmt.finalize();
    */
    //grab the things we need from the database.
    db.each("SELECT * FROM config", function (err, row) {
        console.log(row);
        lockTime = parseInt(row.locktime);
    });
});


// create a timer object
function Timer(fn, t) {
    var timerObj = setInterval(fn, t);

    this.stop = function () {
        if (timerObj) {
            clearInterval(timerObj);
            timerObj = null;
        }
        return this;
    }

    // start timer using current settings (if it's not already running)
    this.start = function () {
        if (!timerObj) {
            this.stop();
            timerObj = setInterval(fn, t);
        }
        return this;
    }

    // start with new interval, stop current interval
    this.reset = function (newT) {
        t = newT;
        return this.stop().start();
    }
}

var timer = new Timer(function () {
    console.log("Lock");
    lock();
}, 2000);

// check if the keyboard or mouse has been used.
ioHook.on("keypress", event => {
    console.log(event);
    // {keychar: 'f', keycode: 19, rawcode: 15, type: 'keypress'}
    dontLock();
});
ioHook.on("mousemove", event => {
    //console.log(event);
    // {keychar: 'f', keycode: 19, rawcode: 15, type: 'keypress'}
    dontLock();
});
ioHook.on("mouseclick", event => {
    console.log(event);
    // {keychar: 'f', keycode: 19, rawcode: 15, type: 'keypress'}
    dontLock();
});
ioHook.start();


function dontLock() {
    //reset the lock timer
    //console.log("Reseting lock timer."); wayyyy too spammy :P
    timer.reset(lockTime);
}

function lock() {
    if (!islocked) {
        console.log("Locking screen...");
        exec(lockCommand, (err, stdout, stderr) => {
            if (err) {
                // node couldn't execute the command
                return;
            }

            // the *entire* stdout and stderr (buffered)
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        });
        islocked = true;
    } else {
        console.log("Already in lock screen.")
    }

}
// switch interval to 10 seconds
//timer.reset(10000);

// stop the timer
//timer.stop();

// start the timer
//timer.start();



db.close();
