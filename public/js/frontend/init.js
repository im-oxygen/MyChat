window["$io"] = io(location.origin);
window["$vm"] = new Vue({
    el: "#app",
    data: {
        view_msg: "",
        input_msg: "",
        input_name: localStorage.getItem("__nickname"),
    },
    created(){
       this.keyupEnter()
       document.getElementById("message").scrollTop = document.getElementById("message").scrollHeight;
    },
    methods: {
        send_msg() {
            if (this.input_msg != "" && this.input_msg != " ") {
                let _m = {
                    name: this.input_name,
                    msg: this.input_msg,
                    ts: new Date().getTime(),
                };
                $io.emit("commit_msg", _m);
                console.log("Commit Message", _m);
                this.view_msg += this.input_name+": "+this.input_msg+"\n";
                this.input_msg = "";
                
                localStorage.setItem("__nickname", this.input_name);
            }
            document.getElementById("message").scrollTop = document.getElementById("message").scrollHeight;
        },
        keyupEnter(){
                document.onkeydown = e =>{
                    let body = document.getElementById("__input");
                    if (e.keyCode === 13 && e.target === body) {
                        console.log("Send Message By Keydown!");
                        this.send_msg();
                    }
            }
        },
    },
});

$io.on("msg_history", (s) => {
    window["$vm"].view_msg = "";
    console.log("Message History:", s)
    s.forEach((e) => {
        window["$vm"].view_msg += e.NICKNAME + ": " + e.CONTENT + "\n";
    });
    setTimeout(()=>document.getElementById("message").scrollTop = document.getElementById("message").scrollHeight, 450);
    
});

$io.on("update_msg", async(s) => {
    console.log("New Message:", s);
    window["$vm"].view_msg += s.NICKNAME + ": " + s.CONTENT + "\n";
});

$io.emit("get_msg_history");