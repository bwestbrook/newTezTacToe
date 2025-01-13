const express = require('express')
const path = require('path')
const cool = require('cool-ascii-faces')

const port = process.env.PORT || 5007

const app = express()
//app.use(express.static(path.join(__dirname, 'public')))
const server = require('express')(express.static(path.join(__dirname, 'public')))
const http = require('http').createServer(server);
const io = require('socket.io')(http ,
        {
            cors: {
                origin: '*'
            }
        }
    )


app.get('/', (req, res) => {
  console.log(`Rendering 'pages/index' for route '/'`)
  res.render('pages/index')
})

app.get('/cool', (req, res) => {
  console.log(`Rendering a cool ascii face for route '/cool'`)
  res.send(cool())
})


io.on("connection", function(socket) {
  console.log("user " + socket.id + " connected");
});


app.listen(port, () => {
  console.log(`Listening on ${port}`)

})


