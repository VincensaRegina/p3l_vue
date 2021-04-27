<template>
  <main>
    <v-container fluid fill-height class="posisinya gradienMerah2">
      <v-layout flex align-center justify-center>
        <v-card
          style="
            padding: 30px 40px 10px 0px;
            border-radius: 20px;
            border: transparent;
          "
          elevation="24"
        >
          <div class="centered">
            <div class="flexbox">
              <div class="left-half">
                <img
                  src="../assets/AKBresto.png"
                  alt="logo"
                  height="200px"
                  class="center"
                />
              </div>
              <v-divider class="mx-2" vertical></v-divider>
              <div class="right-half">
                <h2
                  style="
                    font-family: 'Playfair Display', serif;
                    font-weight: 600;
                  "
                >
                  User Login
                </h2>
                <br />
                <v-form v-model="valid" ref="form">
                  <v-text-field
                    label="E-mail"
                    v-model="email"
                    :rules="emailRules"
                    required
                    outlined
                  ></v-text-field>
                  <v-text-field
                    label="Password"
                    v-model="password"
                    type="password"
                    :rules="passwordRules"
                    required
                    outlined
                  >
                  </v-text-field>
                  <v-layout justify-end>
                    <v-btn
                      class="mr-2"
                      @click="login"
                      :class="{
                        'grey darken-1 white--text': valid,
                        disabled: !valid,
                      }"
                      >Login
                    </v-btn>
                  </v-layout>
                </v-form>
              </div>
            </div>
          </div>
        </v-card>
      </v-layout>
      <v-snackbar v-model="snackbar" :color="color" timeout="2000" bottom>
        {{ error_message }}
      </v-snackbar>
    </v-container>
  </main>
</template>

 <style scoped>
.posisinya {
  position: absolute;
  left: 0px;
  right: 0px;
  font-family: "Montserrat", sans-serif;
}

.center {
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-top: 15px;
}
</style>

 <script>
export default {
  name: "Login",
  data() {
    return {
      load: false,
      snackbar: false,
      error_message: "",
      color: "",
      valid: false,
      password: "",
      posisi: "",
      passwordRules: [(v) => !!v || "Password tidak boleh kosong"],
      email: "",
      emailRules: [(v) => !!v || "E-mail tidak boleh kosong"],
    };
  },
  methods: {
    login() {
      if (this.$refs.form.validate()) {
        //cek apakah data yang akan dikirim sudah valid
        this.load = true;
        this.$http
          .post(this.$api + "/login", {
            email: this.email,
            password: this.password,
          })
          .then((response) => {
            localStorage.setItem("id", response.data.user.id); //menyimpan id user yang sedang login
            localStorage.setItem("token", response.data.access_token);
            //menyimpan auth token
            this.error_message = response.data.message;
            console.log("masuk then");
            this.color = "green";
            this.snackbar = true;
            this.load = false;
            this.$refs.form.reset();
            //Baca data posisi karyawan yg login
            this.readData();
          })
          .catch((error) => {
            console.log("masuk catch");
            this.error_message = error.response.data.message;
            this.color = "red";
            this.snackbar = true;
            localStorage.removeItem("token");
            this.load = false;
          });
      }
    },

    readData() {
      var url = this.$api + "/user";
      this.$http
        .get(url, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          this.posisi = response.data.posisi;
          console.log(this.posisi);
          localStorage.setItem("posisi", this.posisi);

          if (this.posisi == "Operational Manager") {
            this.$router.push("/om/karyawan");
          } else if (this.posisi == "Owner") {
            this.$router.push("/owner/karyawan");
          } else if (this.posisi == "Waiter") {
            this.$router.push("/waiter/customer");
          } else if (this.posisi == "Chef") {
            this.$router.push("/chef/bahan");
          } else if (this.posisi == "Cashier") {
            this.$router.push("/cashier/customer");
          }
        });
    },
  },
};
</script> 

<style scoped>
.centered {
  display: grid;
  place-items: center;

  resize: both;
  overflow: auto;
}

.flexbox {
  display: flex;
  flex-direction: row;
  font-family: "Montserrat", sans-serif;
  width: 50vw;
}
.left-half {
  flex: 30%;
  padding: 1rem;
}

.right-half {
  flex: 70%;
  padding: 1rem;
}
</style>