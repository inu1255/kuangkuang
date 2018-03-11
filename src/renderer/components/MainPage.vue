<template>
	<div class="main" v-loading="loading||oneday<0" :element-loading-text="loading_text">
		<div role="alert" class="el-alert el-alert--success">
			<div class="el-alert__content">
				<span class="el-alert__title">24小时预计收益: ￥{{(oneday
					<=0?1:oneday).toFixed(2)}}</span><br/>
						<span class="el-alert__title">总收益: ￥{{money.toFixed(2)}}</span><br/>
						<span class="el-alert__title">已兑现: ￥{{used_money.toFixed(2)}}</span><br/>
			</div>
			<el-button style="margin-left:60px;" type="primary" round @click="refresh" size="mini">刷新</el-button>
		</div>
		<div class="block">
			<span class="demonstration">支付宝收款账户</span>
			<el-input placeholder="填写支付宝账号以获取佣金" v-model="name" size="small" style="margin-top: 13px;"></el-input>
		</div>
		<div class="block">
			<span class="demonstration">强度:{{power}}</span>
			<div style="padding:0 3px;">
				<el-slider v-model="power" :step="1" show-stops :max="8" :min="1"></el-slider>
			</div>
		</div>
		<div class="title">
			<el-tag :type="running?`success`:`danger`">当前使用{{card}}</el-tag>
			<el-button style="margin-left:7px;" type="primary" round @click="start" size="mini">{{running?"停止":"开始赚钱"}}</el-button>
		</div>
		<el-checkbox v-model="autostart">开机启动</el-checkbox>
	</div>
</template>

<script>
const { ipcRenderer } = require('electron')
import request from '@/utils/request'

export default {
	data() {
		return {
			loading: true,
			loading_text: "正在检测GPU",
			running: false,
			name: "",
			power: 8,
			oname: "",
			opower: 8,
			oneday: 0,
			money: 0,
			used_money: 0,
			card: "cpu",
			autostart: false,
		}
	},
	methods: {
		async start() {
			if (this.running) {
				ipcRenderer.send("stop", this.name, this.power)
			} else {
				ipcRenderer.send("start", this.name, this.power)
				this.loading = true
			}
		},
		async refresh() {
			this.oneday = -1
			this.loading_text = "正在刷新..."
			ipcRenderer.send("refresh", this.name, this.power)
		}
	},
	watch: {
		autostart(v) {
			ipcRenderer.send("autostart", v)
		}
	},
	mounted() {
		this.start()
		ipcRenderer.on("card-check", (event, arg) => {
			this.loading_text = arg
		})
		ipcRenderer.on("card-use", (event, arg) => {
			this.card = arg
			this.loading = false
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
}
</style>
