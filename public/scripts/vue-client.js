const app = new Vue({
  el: '#app',
  data: {
    currentTitle: null,
    currentFile: [],
    files: [],
    uploadReady: true,
    uploadError: false,
    uploadErrorReason: '',
    placesFilter: 'all',
    fileError: null,
    fileLoading: false,
    currentStatus: null
  },
  mounted() {
    this.getFiles();
  },
  computed: {
    overlapCount() {
      return this.currentFile.filter(place => place.overlap).length
    },
    placesList() {
      return this.placesFilter === 'all' ? this.currentFile :
        this.placesFilter === 'include' ? this.currentFile.filter(place => place.overlap) :
          this.currentFile.filter(place => !place.overlap)
    },
    fileStatus() {
      return this.fileLoading ? 'Файл загружается' :
        this.currentStatus === 'done' ? 'Просчет завершен' : 'Ведется просчет';
    },
  },
  methods: {
    async getFiles() {
      axios.get('api/files')
        .then(response => {
          if (response.data.result && response.data.files) {
            for (let i = 0; i < response.data.files.length; i++) {
              const file = response.data.files[i];
              this.files.push(file.filename);
            }
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    async changeCurrentFile(filename) {
      this.fileLoading = true;
      this.fileError = null;
      this.currentFile = [];
      this.currentTitle = filename;
      axios.get(`api/files/${filename}`)
        .then(response => {
          this.fileLoading = false;
          if (response.data.result && response.data.file) {
            this.currentFile = response.data.file;
            this.currentStatus = response.data.status;
          } else {
            this.fileError = 'Ошибка открытия файла';
          }
        })
        .catch(function (error) {
          this.fileError = 'Ошибка загрузки файла';
          console.log(error);
        });
    },
    sendNewFile() {
      const file =this.$refs.newFile.files[0];
      let formData = new FormData();
      formData.append('file', file);
      axios.post( 'api/files', formData, {
          headers: {'Content-Type': 'multipart/form-data'},
        }
      ).then(response => {
        console.log('NEW FILE RESPONSE::: ', response);
        if (response.data.result) {
          this.files.push(response.data.filename);
          this.uploadError = false;
        } else {
          this.uploadError = true;
          this.uploadErrorReason = response.data.error;
        }
        this.uploadReady = false;
        this.$nextTick(() => {
          this.uploadReady = true;
        });
      })
        .catch( e => {
          console.log('Error: ', e);
        });
    },
    changePagesFilter() {
      this.placesFilter = this.$refs.filter.value;
    },
  }
});
