require('bootstrap/dist/css/bootstrap.min.css');

const request = require('browser-request');
const io = require('socket.io-client');

const yo = require('yo-yo');
const _ = require('lodash');

const START_MSG = 'Start';
const STOP_MSG = 'Stop';

const ProjectHeader = (p) => {
  let style = `background: #f9f9f9; color:black;
    height: 42px; border-bottom: 1px solid gainsboro;
    font-size: 12px; padding-top: 9px;
    text-align: center;`;

  let colStyle=`
    background:#f9f9f9; top:-3px;
  `;

  if (p == undefined) return yo`<div class="row" style="${style}"></div>`;

  return yo`
    <div class="row" style="${style}">
      <div class="col-sm-4" style="${colStyle}">${p.name}</div>
      <div class="col-sm-4" style="${colStyle}">${p.path}</div>
      <div class="col-sm-4" style="${colStyle}">${p.pid || "stopped"}</div>
    </div>
  `;
};

const ProjectLog = (p) => {
  return yo`
    <div>
      <div class="row" style="color: #23f100; display: block;padding:10px;">
        ${_.map(p.log || [], (d) => yo`<div>${d}</div>`)}
      </div>
      <div>------</div>
      <div class="row" style="display: block;padding:10px;">
        ${_.map(p.prevLog || [], (d) => yo`<div>${d}</div>`)}
      </div>
    </div>
  `;
}

const ProjectListItem = (p, onclick, onstart, onstop) => {
  let on  = 'btn-outline-success';
  let off = 'btn-outline-secondary';

  return yo`
    <a class="btn ${p.pid ? on : off }"
      style="width:100%;background:white;
      color: ${p.pid ? 'green' : 'grey'}" href="#project__${p.name}__${p.path}"
      onclick=${onclick.bind(undefined, p.name, p.path)}>
      <div style="overflow:hidden;">${p.name}</div>
      <div style="overflow:hidden;font-size: 13px;">${p.path}</div>
      <div style="text-align:center;">
        <button class="btn btn-success"
          style="${Styles.startButton}"
          onclick=${onstart.bind(undefined, p)}
          ${
            p.pid ? "disabled" : ""
          }>Start</button>
        <button class="btn btn-danger"
          style="${Styles.startButton}"
          onclick="${onstop.bind(undefined, p)}"
          ${
            p.pid ? "" : "disabled"
          }>Stop</button>
      </div>
  </a>
  `
};

class YacDashboard {
  constructor(container) {
    _.extend(document.body.style, Styles.body);
    this.container = container;
    this.socket = io('http://localhost:8009');
    this.socket.on('data', this.onEvent.bind(this));
    this.init();
  }

  onEvent(data) {
    this.render(data);
  }

  stop(p, e) {
    e.stopPropagation();
    const body = JSON.stringify(p);
    const req = {method:'POST', url:'/stop', body: body, json:true};
    request(req, () => {
      this.init();
    });
  }

  start(p, e) {
    e.stopPropagation();
    const body = JSON.stringify(p);
    const req = {method:'POST', url:'/start', body: body, json:true};
    request(req, () => {
      this.init();
    });
  }

  render (projects) {
    let anchor = window.location.hash.split("__");
    let projectName = anchor[1];
    let projectPath = anchor[2];

    let proj = _.find(projects, {name: projectName, path: projectPath});;

    this.container.innerHTML = "";
    this.container.appendChild(yo`
      <div class="container" style="${Styles.container}" >
        <nav class="navbar navbar-light" style="height:70px; min-height: 70px !important">
          <a class="navbar-brand" href="#">
            <img src="/logo" height="60" alt="">
          </a>
        </nav>
        <div class="row" style="flex-grow: 1; border-top: 1px solid #c1c1c1">
          <div class="col-sm-3" style="background: white;">
            <div class="row" style="
              height: 42px; margin-bottom: 18px;
              border-bottom: 1px solid gainsboro; background: #f9f9f9">
            </div>
            ${_.map(projects, (p) => yo`
              <div class="row">
                <div class="col-sm-12" style="padding: 5px;">
                  ${ProjectListItem(p,
                      this.init.bind(this),
                      this.start.bind(this),
                      this.stop.bind(this)
                    )}
                </div>
              </div>
            `)}
          </div>
          <div class="col-sm-9" id="dashboard:projectInfo"
            style="background: #2b2b2b; overflow:auto; color:white;">
            ${ProjectHeader(proj)}
            ${ (proj == undefined) ? yo`<p></p>` : ProjectLog(proj)}
          </div>
        </div>
      </div>
    `);
  }

  init() {
    request('/yacInfo.json', (err, res, body) => {
      let projects = JSON.parse(body);
      this.render(projects);
    });
  }
}

const Styles = {
  body: {
    background: "#f9f9f9",
    paddingTop: "16px",
    paddingBottom: "16px"
  },
  container: `
    background: #e0e0e0;
    height: 100%;
    display: flex;
    flex-direction: column;
    border: 1px solid #c1c1c1;
    border-radius: 4px;
  `,
  headerRow: `
    background: #f1f1f1;
  `,
  headerCol: `
    padding: 10px;
    text-align: center;
  `,
  startButton: `
    font-size: 12px; font-weight: bold; padding: 1px 3px;
  `
}

module.exports = YacDashboard;
module.exports.init = (container) => { new YacDashboard(container)};
