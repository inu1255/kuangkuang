<template>
	<div class="main" v-loading="loading" :element-loading-text="loading_text">
		<div class="block">
			<span class="demonstration">支付宝</span>
			<el-input placeholder="填写支付宝账号以获取佣金" v-model="name" size="small" style="margin-top: 13px;"></el-input>
		</div>
		<div class="block">
			<span class="demonstration">强度</span>
			<div style="padding:0 3px;">
				<el-slider v-model="power" :step="1" show-stops :max="8" :min="1"></el-slider>
			</div>
		</div>
		<div class="title">
			<el-tag :type="running?`success`:`danger`">当前{{loading_text}}</el-tag>
			<el-button style="margin-left:7px;" type="primary" round @click="start" size="mini">{{running?"停止":"开始赚钱"}}</el-button>
		</div>
	</div>
</template>

<script>
const { ipcRenderer } = require('electron')

export default {
	data() {
		return {
			loading: true,
			loading_text: "正在检测GPU",
			running: false,
			name: "",
			power: 8,
			oname: "",
			opower: 8
		}
	},
	methods: {
		start() {
			if (this.running) {
				ipcRenderer.send("stop", this.name, this.power)
			} else {
				ipcRenderer.send("start", this.name, this.power)
				this.loading = true
			}
		}
	},
	mounted() {
		this.start()
		ipcRenderer.on("card-check", (event, arg) => {
			this.loading_text = arg
		})
		ipcRenderer.on("card-use", (event, arg) => {
			this.loading_text = arg
			this.loading = false
		})
		ipcRenderer.on("running", (event, running, name, power) => {
			this.running = running
			if (name != this.oname) this.oname = this.name = name;
			if (power != this.opower) this.opower = this.power = power;
		})
	},
	destroyed() {
		ipcRenderer.removeAllListeners("card-check")
		ipcRenderer.removeAllListeners("card-use")
		ipcRenderer.removeAllListeners("running")
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
  padding: 25px;
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
