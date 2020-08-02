<template>
    <div class="login_container">
        <div class="login_box">
            <!-- 头像区域 -->
            <div class="avatar_box">
                <img src="../assets/images/1.png">
            </div>
            <!-- 登录表单区域 -->
            <el-form ref="loginRef" class="login_form" :model="formData" :rules="inputRules">
                <!-- 用户名 -->
                <el-form-item prop="username">
                    <el-input prefix-icon="iconfont icon-users" v-model="formData.username"></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                    <el-input prefix-icon="iconfont icon-3702mima" type="password"
                              v-model="formData.password"></el-input>
                </el-form-item>
                <el-form-item class="login_btn">
                    <el-button type="primary" @click="validate">登录</el-button>
                    <el-button type="info" @click="reset">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
    data () {
        return {
            formData: {
                username: 'admin',
                password: '123456'
            },
            inputRules: {
                username: [
                    {
                        required: true,
                        message: '请输入用户名',
                        trigger: 'blur'
                    },
                    {
                        max: 8,
                        min: 3,
                        message: '请输入 3 到 8 位之间的用户名',
                        trigger: 'blur'
                    }
                ],
                password: [
                    {
                        required: true,
                        message: '请输入密码',
                        trigger: 'blur'
                    },
                    {
                        max: 16,
                        min: 6,
                        message: '请输入 6 到 16 位之间的密码',
                        trigger: 'blur'
                    }
                ]
            }
        }
    },
    methods: {
        reset () {
            this.$refs.loginRef.resetFields()
        },
        validate () {
            this.$refs.loginRef.validate(async (valid) => {
                if (!valid) return
                let { data } = await this.$http.post('login', this.formData)
                // 如果登录失败直接return 结束函数继续往下进行
                if (data.meta.status != 200) return this.$message.error('登录失败, 请检查您的用户名或密码是否正确!')
                this.$message.success('登录成功')
                // 将token存储到sessionStorage中
                window.sessionStorage.setItem('token', data.data.token)
                this.$router.push('/home')
            })
        }
    }
}
</script>

<style type="less" scoped>
.login_container {
    width: 100%;
    height: 100%;
    background-color: #2b4b6b;
}

.login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.avatar_box {
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #eeeeee;
    background-color: #fff;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
}

img {
    width: 130px;
    height: 130px;
    border-radius: 50%;
    background-size: 100%;
    background-color: #eeeeee;
}

.login_form {
    width: 100%;
    position: absolute;
    bottom: 0;
    padding: 0 20px;
    box-sizing: border-box;
}

.login_btn {
    display: flex;
    justify-content: flex-end;
}

</style>
