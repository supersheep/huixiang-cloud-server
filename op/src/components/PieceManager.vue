<template>
  <el-table
    :data="pieces"
    border
    style="width: 100%">
    <el-table-column
      inline-template
      label="id"
      width="150">
      <div>
        <span style="margin-left: 10px">{{ row.objectId }}</span>
      </div>
    </el-table-column>
    <el-table-column
      inline-template
      label="用户"
      width="150">
      <router-link :to="'/piece?userId=' + row.user.objectId" tag="a">{{row.user.name || row.user.username}}</router-link>
    </el-table-column>
    <el-table-column
      inline-template
      label="内容"
      width="400">
      <div>{{row.content}}</div>
    </el-table-column>

    <el-table-column
      inline-template
      label="时间"
      width="150">
      <div>{{timeStr(row.createdAt)}}</div>
    </el-table-column>

    <el-table-column
      :context="_self"
      inline-template
      label="操作">
      <div>
        <span v-if="row.rank">
          {{row.rank}}分
        </span>
        <span>
          <el-button
            size="small"
            type="success"
            @click="handleRank($index, row, 8)">
            好
          </el-button>
          <el-button
            size="small"
            type="warning"
            @click="handleRank($index, row, 6)">
            中
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleRank($index, row, 3)">
            差
          </el-button>
        </span>
        <!-- <el-button
          size="small"
          @click="handleEdit($index, row)">
          编辑
        </el-button> -->
        <el-button
          size="small"
          type="danger"
          @click="handleDelete($index, row)">
          删除
        </el-button>
      </div>
    </el-table-column>
  </el-table>
</template>

<script>
  import request from 'request'
  import moment from 'moment'

  export default {
    data () {
      return {
        pieces: []
      }
    },
    watch: {
      '$route': 'fetchData'
    },
    updated () {
      console.log('updated')
    },
    mounted () {
      this.fetchData()
    },
    methods: {
      fetchData () {
        console.log(this.$route.query)
        request.get('/piece', this.$route.query)
          .then((pieces) => {
            console.log(pieces)
            this.pieces = pieces
          })
          .catch((err) => {
            console.log(err)
          })
      },
      timeStr (timestamp) {
        return moment(timestamp).format('YYYY-MM-DD HH:mm')
      },
      handleEdit (index, row) {
        // request.delete('/piece/' + row.objectId)
      },
      handleRank (index, row, rank) {
        request.put('/piece/' + row.objectId, {
          rank: rank
        })
        .then(() => {
          this.pieces[index].rank = rank
          this.pieces = this.pieces.concat([])
        })
      },
      handleDelete (index, row) {
        if (confirm('确认删除该条记录么')) {
          request.delete('/piece/' + row.objectId)
            .then(() => {
              this.pieces.splice(index, 1)
            })
        }
      }
    }
  }
</script>
