<template>
	<div class="main" style="-webkit-app-region: drag" v-loading="loading||oneday<0" :element-loading-text="loading_text">
		<div class="header">
			<div style="-webkit-app-region: no-drag" class="el-icon-error" @click="hide"></div>
		</div>
		<div style="-webkit-app-region: no-drag" role="alert" class="el-alert el-alert--success">
			<div class="el-alert__content">
				<span class="el-alert__title">过去24小时收益: ￥{{(name=="test"?0:oneday).toFixed(2)}}</span><br/>
				<span class="el-alert__title">总收益: ￥{{(name=="test"?0:money).toFixed(2)}}</span><br/>
				<span class="el-alert__title">已兑现: ￥{{(name=="test"?0:used_money).toFixed(2)}}</span><br/>
			</div>
			<el-button style="margin-left:60px;" type="primary" round @click="refresh" size="mini">刷新</el-button>
		</div>
		<div style="-webkit-app-region: no-drag" class="block">
			<span class="demonstration">支付宝收款账户</span>
			<el-input placeholder="填写支付宝账号以获取佣金" v-model="name" size="small" style="margin-top: 13px;">
				<el-button slot="append" @click="start">保存</el-button>
			</el-input>
		</div>
		<div style="-webkit-app-region: no-drag" class="block">
			<span class="demonstration">强度:{{power}}</span>
			<div style="padding:0 3px;">
				<el-slider v-model="power" :step="1" show-stops :max="8" :min="1"></el-slider>
			</div>
		</div>
		<div style="-webkit-app-region: no-drag" class="title">
			<el-checkbox :class="{stop:!running.a}" v-model="what.a">A卡</el-checkbox>
			<el-checkbox :class="{stop:!running.n}" v-model="what.n">N卡</el-checkbox>
			<el-checkbox :class="{stop:!running.c}" v-model="what.c">CPU</el-checkbox>
			<el-button style="margin-left:7px;" type="primary" round @click="toggle" size="mini">{{isRun?"停止":"开始赚钱"}}</el-button>
		</div>
		<el-checkbox style="-webkit-app-region: no-drag" v-model="autostart">开机启动</el-checkbox>
		<div style="-webkit-app-region: no-drag" class="footer">
			<a @click="home">官方网站: wqbao.in</a>
		</div>
	</div>
</template>

<script>
const { ipcRenderer, shell } = require('electron')
import request from '@/utils/request'

export default {
	data() {
		return {
			loading: false,
			loading_text: "正在检测GPU",
			name: "",
			power: 4,
			oneday: 0,
			money: 0,
			used_money: 0,
			card: "cpu",
			autostart: true,
			what: {
				a: true,
				n: true,
				c: true,
			},
			running: {

			}
		}
	},
	computed: {
		isRun() {
			for (let k in this.running) {
				let v = this.running[k]
				if (v) {
					return true
				}
			}
			return false
		}
	},
	methods: {
		async toggle() {
			if (this.isRun) {
				this.stop()
			} else {
				this.start()
			}
		},
		stop() {
			ipcRenderer.send("stop", this.name, this.power)
		},
		start() {
			let what = []
			for(let k in this.what){
				let v = this.what[k]
				if (v) what.push(k)
			}
			ipcRenderer.send("start", this.name, this.power, what)
			this.loading = new Date().getTime()
		},
		async refresh() {
			this.oneday = -1
			this.loading_text = "正在刷新..."
			ipcRenderer.send("refresh", this.name, this.power)
		},
		hide() {
			console.log("hide")
			ipcRenderer.send("hide")
		},
		home() {
			shell.openExternal('http://wqbao.in')
		}
	},
	watch: {
		autostart(v) {
			ipcRenderer.send("autostart", v)
		},
		what: {
			deep: true,
			handler(what, old) {
				console.log(what)
			}
		},
		running() {
			if (this.loading && new Date().getTime() - this.loading > 5e3) {
				this.loading = false
				if (!this.isRun) {
					this.$message.error("启动失败")
				}
			}
		}
	},
	mounted() {
		ipcRenderer.on("config", (event, config) => {
			this.config = config
			this.name = config.name
			this.power = config.power
			this.id = config.id
			for (let k of config.what || []) {
				this.what[k] = true
			}
			this.start()
		})
		ipcRenderer.send("config")
		ipcRenderer.on("card-check", (event, arg) => {
			this.loading_text = arg
		})
		ipcRenderer.on("card-use", (event, arg) => {
			this.card = arg
		})
		ipcRenderer.on("set", (event, data) => {
			for (let k in data) {
				let v = data[k]
				console.log("set", k, v)
				this[k] = v
			}
		})
		ipcRenderer.on("update", (event, info) => {
			this.$message.success(info)
		})
	},
	destroyed() {
		ipcRenderer.removeAllListeners("card-check")
		ipcRenderer.removeAllListeners("card-use")
		ipcRenderer.removeAllListeners("running")
		ipcRenderer.removeAllListeners("update")
	}
}
</script>

<style lang="less">
.main {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 25px 25px 25px;
  background: url(../assets/header.jpg) no-repeat fixed top;
  background-size: 100% 100%;
  color: #eee;
  .title {
    text-align: center;
  }
  > * {
    margin-top: 13px;
  }
  .header {
    position: fixed;
    z-index: 9999;
    top: 0;
    right: 0;
    margin-top: 0;
    .el-icon-error {
      cursor: pointer;
      float: right;
      padding: 3px;
    }
  }
  .stop .el-checkbox__input.is-checked + .el-checkbox__label {
    color: #f56c6c;
  }
  .stop .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #f56c6c;
    border-color: #f56c6c;
  }
  .footer {
    text-align: center;
    cursor: pointer;
  }
}
</style>
