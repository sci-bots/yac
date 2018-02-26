require('bootstrap/dist/css/bootstrap.min.css');

const request = require('browser-request');
const yo = require('yo-yo');
const _ = require('lodash');

const START_MSG = 'Start';
const STOP_MSG = 'Stop';

let prevHash = "";

const DashboardColumn = (content, colPos='mid', rowPos='mid') => {
  const Styles = {
    col: `
      border-radius: 0px;
      border: 1px solid #d2d2d2;
      padding:10px;
      ${colPos == 'first' ? "border-right: none" : ""};
      ${colPos == 'last' ?  "border-left: none" : ""};
      ${rowPos == 'first' ? "border-bottom: none" : ""};
      background: none;
      ${rowPos == 'first' ? "background: #f1f1f1" : ""};
    `
  }
  return yo`
  <div class="col-sm" style="${Styles.col}">
    ${content}
  </div>
  `
}

const DashboardButton = (p, callback) => {
  let msg;
  if (p.pid != undefined) msg = STOP_MSG;
  if (p.pid == undefined) msg = START_MSG;

  return yo`
    <button type="button"
      class="btn btn-${p.pid == undefined ? 'success' : 'danger'}"
      onclick=${callback.bind(this, p, msg)}>
      ${msg}
    </button>
  `
}

class YacDashboard {
  constructor(container) {
    _.extend(document.body.style, Styles.body);
    this.container = container;
    this.render();
    setInterval(() => {
      this.render()
    }, 500);
  }

  startPlugin(p, msg, e){
    if (msg == START_MSG) console.log("Starting!");
    if (msg == STOP_MSG)  console.log("Stopping!");

    const body = JSON.stringify(p);
    const req = {method:'POST', url:'/start', body: body, json:true};
    request(req, (err, res, body) => {
      this.render();
    });
  }

  expandLog(log, prevLog, e) {
    console.log("EXPANDING LOG!");
    console.log(args);
  }

  render() {
    request('/yacInfo.json', (err, res, body) => {
      let {projects, hash} = JSON.parse(body);
      if (hash == prevHash) return;

      console.log({projects});
      prevHash = hash;

      this.container.innerHTML = "";
      this.container.appendChild(yo`
        <div class="container" style="${Styles.container}" >
          <nav class="navbar navbar-light">
            <a class="navbar-brand" href="#">
              <img src="/logo.png" width="100" alt="">
            </a>
          </nav>

          <div class="row">
            ${DashboardColumn('Project Name', 'first', 'first')}
            ${DashboardColumn('Project Path', 'mid', 'first')}
            ${DashboardColumn('Process ID', 'mid', 'first')}
            ${DashboardColumn('Start/Stop', 'mid', 'first')}
            ${DashboardColumn('Logs', 'last', 'first')}
          </div>
            ${_.map(projects, (p) => yo`
              <div class="row">
                ${DashboardColumn(p.name, 'first')}
                ${DashboardColumn(p.path, 'mid')}
                ${DashboardColumn(p.pid || 'not running', 'mid')}
                ${DashboardColumn(
                    DashboardButton(p, this.startPlugin.bind(this)),
                  'mid')}
                ${DashboardColumn(yo`
                  <div
                    onmouseover=${function (){_.extend(this.style, Styles.miniLogOver)}}
                    onmouseout=${function (){_.extend(this.style, Styles.miniLogOut)}}
                    onclick=${this.expandLog.bind(this, p.log, p.prevLog)}
                    style="${Styles.miniLog}">
                    <p style="margin: 0px; color: #23f100;">${p.log}</p>
                    <p style="margin: 0px; color: #afafaf">${p.prevLog}</p>
                  </div>
                `, 'last')}
              </div>
            `
            )}
        </div>
      `);
    });
  }
}

const Styles = {
  body: {
    background: "#212529",
    paddingTop: "16px"
  },
  container: `
    background: white;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.65), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  `,
  miniLog: `
    background: #1b1b1b;
    font-size: 10px;
    width: 100%;
    height: 100%;
    top: 0px;
    left: 0px;
    position: absolute;
    overflow: hidden;
    cursor: pointer;
  `,
  miniLogOver: {
    backgroundColor: 'black'
  },
  miniLogOut: {
    backgroundColor: '#1b1b1b'
  }
}

module.exports = YacDashboard;
module.exports.init = (container) => { new YacDashboard(container)};
