<template>
  <el-table
    :data="pieces"
    border
    style="width: 100%">
    <el-table-column
      inline-template
      label="id"
      width="250">
      <div>
        <span style="margin-left: 10px">{{ row.objectId }}</span>
      </div>
    </el-table-column>
    <el-table-column
      inline-template
      label="内容"
      width="600">
      <div>{{row.content}}</div>
    </el-table-column>
    <el-table-column
      :context="_self"
      inline-template
      label="操作">
      <div>
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

  export default {
    data () {
      return {
        pieces: []
      }
    },
    mounted () {
      request.get('/piece')
        .then((pieces) => {
          this.pieces = pieces
        })
    },
    methods: {
      handleEdit (index, row) {
        // request.delete('/piece/' + row.objectId)
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
