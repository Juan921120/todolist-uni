<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}
html, body, page {
  height: 100%;
  margin: 0;
  padding: 0;
  background-image: url(/static/images/cat-paw.png), url(/static/images/cat-paw.png);
  background-size: 80px 80px, 80px 80px;
  background-position: 0 0, 40px 40px;
  background-repeat: repeat, repeat;
  background-color: #ffe7d6;
}

 .user-info-bar{
		width: 30%;
		padding: 20rpx;
		margin: 0 auto;
		display: flex;
	}
.user-avatar {

  width: 42px;
  height: 42px;
  border-radius: 50%;
  margin-right: 10px;
  background: #fff;
  border: 2px solid #ffccaa;
  object-fit: cover;
}

.user-name {
  line-height: 42px;
  text-align: center;
  font-size: 18px;
  color: #333;
  font-weight: bold;
  font-family: 'Comic Sans MS', 'Arial Rounded MT Bold', sans-serif;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
  button {
    background-color: #f9f9f9;
  }
}

</style>
