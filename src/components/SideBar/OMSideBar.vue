<template>
  <v-app>
    <div class="dashboard">
      <v-navigation-drawer v-model="drawer" width="256" app color="#FBFEF9">
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title
              style="font-family: 'Montserrat', sans-serif; color: white"
            >
              <img
                src="../../assets/AKBrestoOneLine.png"
                alt="logo"
                height="45px"
                style="display: block; margin: 0 auto"
              />
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>

        <v-list dense nav>
          <v-list-item
            v-for="item in items"
            :key="item.title"
            link
            tag="router-link"
            :to="item.to"
            :color="merah"
          >
            <v-list-item-icon>
              <v-icon> {{ item.icon }} </v-icon>
            </v-list-item-icon>
            <v-list-item-title class="decreaseFSize">{{
              item.title
            }}</v-list-item-title>
          </v-list-item>

          <v-list-group no-action>
            <template v-slot:activator>
              <v-list-item-icon>
                <v-icon> mdi-history </v-icon>
              </v-list-item-icon>
              <v-list-item-title class="decreaseFSize"
                >Riwayat</v-list-item-title
              >
            </template>
            <v-list-item
              v-for="item2 in riwayat"
              :key="item2.title"
              link
              :to="item2.to"
              :color="merah"
            >
              <v-list-item-title
                class="decreaseFSize"
                v-text="item2.title"
              ></v-list-item-title>
            </v-list-item>
          </v-list-group>

          <!-- Laporan -->
          <v-list-item to="/om/laporan" :color="merah">
            <v-list-item-icon>
              <v-icon>mdi-file-chart</v-icon>
            </v-list-item-icon>
            <v-list-item-title class="decreaseFSize">Laporan</v-list-item-title>
          </v-list-item>
        </v-list>

        <template v-slot:append>
          <div class="pa-5">
            <v-btn
              block
              class="gradienMerah decreaseFSize"
              style="color: #f6f4f3"
              @click="dialogPassword = true"
            >
              Ubah Password
            </v-btn>
          </div>
        </template>
      </v-navigation-drawer>

      <!-- APP BAR -->
      <v-app-bar app fixed height="70px" class="gradienMerah">
        <v-app-bar-nav-icon
          @click.stop="drawer = !drawer"
          :color="putih"
        ></v-app-bar-nav-icon>
        <v-divider class="mx-3" vertical :color="putih"></v-divider>
        <VSpacer />

        <div style="font-weight: 400; font-size: 15px; color: #f6f4f3">
          <b> Hello, {{ nama }} </b> - {{ posisi }}
        </div>
        <v-divider class="mx-3" vertical :color="putih"></v-divider>
        <v-btn text @click="dialogLogout = true"
          ><v-icon :color="putih">mdi-logout</v-icon></v-btn
        >
      </v-app-bar>

      <!-- Logout -->
      <v-dialog v-model="dialogLogout" persistent max-width="400px">
        <v-card style="font-family: 'Montserrat', sans-serif">
          <v-card-title>
            <span>Peringatan!</span>
          </v-card-title>
          <v-card-text> Anda yakin ingin logout? </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="dialogLogout = false">
              Cancel
            </v-btn>

            <v-btn color="red darken-1" text @click="btnLogout"> Logout </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog Ubah password -->
      <v-dialog v-model="dialogPassword" persistent max-width="400px">
        <v-card style="font-family: 'Montserrat', sans-serif">
          <v-card-title> Ubah Password </v-card-title>
          <v-card-text>
            <v-form ref="form" lazy-validation class="font">
              <v-text-field
                label="Password Saat Ini"
                v-model="pass.oldPass"
                :rules="[(v) => !!v || 'Password saat ini tidak boleh kosong!']"
                required
                type="password"
              ></v-text-field>
              <v-text-field
                label="Password Baru"
                v-model="pass.newPass"
                :rules="[(v) => !!v || 'Password baru tidak boleh kosong!']"
                required
                type="password"
              ></v-text-field>
              <v-text-field
                label="Konfirmasi Password Baru"
                v-model="pass.confirmPass"
                type="password"
                :rules="[
                  (v) => !!v || 'Konfirmasi password tidak boleh kosong!',
                ]"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="dialogPassword = false">
              Cancel
            </v-btn>

            <v-btn color="green darken-1" text @click="changePassword">
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-snackbar v-model="snackbar" :color="color" timeout="2000" bottom>
        {{ error_message }}
      </v-snackbar>

      <div class="fullheight pa-5"><router-view> </router-view></div>
    </div>
  </v-app>
</template>

 <script>
export default {
  name: "Dashboard",
  data() {
    return {
      //snackbar
      snackbar: false,
      color: "",
      error_message: "",

      drawer: true,
      nama: "",
      posisi: "",
      putih: "#F6F4F3",
      merah: "#D24848",
      biru: "#3B3B6B",
      ebony: "#3B3B6B",
      kuning: "#F9DB6D",
      apricot: "#FFCDBC",
      aliceBlue: "##F0F8FF",
      hijau: "#5B8C5A",
      //dialog
      dialogLogout: false,
      dialogPassword: false,
      //keperluan ganti password
      pass: {
        oldPass: null,
        newPass: null,
        confirmPass: null,
      },
      cekHash: null,
      //item di sidebar
      items: [
        { title: "Karyawan", to: "/om/karyawan", icon: "mdi-account-tie" },
        { title: "Customer", to: "/om/customer", icon: "mdi-account" },
        { title: "Bahan", to: "/om/bahan", icon: "mdi-food-steak" },
        { title: "Menu", to: "/om/menu", icon: "mdi-food" },
        { title: "Meja", to: "/om/meja", icon: "mdi-table-furniture" },
        { title: "Reservasi", to: "/om/reservasi", icon: "mdi-clipboard-list" },
        { title: "Pesanan", to: "/om/pesanan", icon: "mdi-playlist-check" },
        { title: "Transaksi", to: "/om/transaksi", icon: "mdi-cash-multiple" },
        { title: "Kartu", to: "/om/kartu", icon: "mdi-card-account-details" },
      ],
      riwayat: [
        { title: "Riwayat Masuk", to: "/om/riwayatMasuk", icon: "mdi-history" },
        {
          title: "Riwayat Keluar",
          to: "/om/riwayatKeluar",
          icon: "mdi-history",
        },
      ],
    };
  },
  methods: {
    btnLogout() {
      localStorage.removeItem("id");
      localStorage.removeItem("token");
      window.setTimeout(200);
      window.location.replace('/');
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
          this.nama = response.data.nama;
          this.posisi = response.data.posisi;
        });
    },
    changePassword() {
      if (this.$refs.form.validate()) {
        let editId = localStorage.getItem("id");
        //jika ganti password
        let url = this.$api + "/hashCheck/" + editId;
        let newData = {
          password: this.pass.oldPass,
        };
        this.$http
          .post(url, newData, {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          })
          .then((response) => {
            this.cekHash = true;
            if (this.cekHash == false) {
              console.log("Old Password salah");
            } else if (
              this.pass.newPass != this.pass.confirmPass ||
              this.pass.newPass == ""
            ) {
              this.error_message = response.data.message;
              this.error_message =
                "Password Baru dan Konfirmasi Password Baru harus sama!";
              this.color = "red";
              this.snackbar = true;
            } else {
              //jika password yg diisi benar
              let formData = new FormData();
              formData.append("password", this.pass.newPass);

              url = this.$api + "/changePassword/" + editId;
              this.$http
                .post(url, formData, {
                  headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                  },
                })
                .then((response) => {
                  console.log(response.data);
                  this.error_message = response.data.message;
                  this.color = "green";
                  this.snackbar = true;
                  this.readData(); //mengambil data
                  this.pass.oldPass = "";
                  this.pass.newPass = "";
                  this.pass.confirmPass = "";
                  this.dialogPassword = false;
                  this.$refs.form.reset();
                })
                .catch((error) => {
                  this.error_message = error.response.data.message;
                  this.color = "red";
                  this.snackbar = true;
                });
            }
          })
          .catch((error) => {
            this.error_message = error.response.data.message;
            this.color = "red";
            this.snackbar = true;
            this.cekHash = false;
          });
      }
    },
  },
  mounted() {
    this.readData();
  },
};
</script>
<style>
.decreaseFSize {
  font-size: 12px !important;
}
.dashboard {
  font-family: "Montserrat", sans-serif;
  color: white;
}
.light {
  font-weight: 500;
}

.title {
  font-family: "Montserrat", sans-serif;
  color: white;
}
.fullheight {
  min-height: 100vh !important;
}
.router {
  text-decoration: none;
  color: black;
}
</style> 