# [◀ Excalidraw Automate 使用指南](../readme.md)

## 使用 dataviewjs 生成家谱树

这个示例与使用 dataviewjs 生成思维导图的脚本类似，但输出结果是垂直呈现的。

### 输出效果

![image](https://user-images.githubusercontent.com/14358394/117549637-d3ecc280-b03b-11eb-952a-840a9a75b6ca.png)

### 输入文件

任务列表格式如下：

```markdown
- [ ] OBSIDIAN
    - [ ] Silver
        - [ ] PawPaw Silv
        - [ ] MawMaw Silv
    - [ ] Licat
        - [ ] PeePaw Li
        - [ ] MeeMaw Li
```

### dataviewjs 脚本

渲染 Excalidraw 图形的代码如下：

```javascript
function crawl(subtasks) {
  let size = subtasks.length > 0 ? 0 : 1; //if no children then a leaf with size 1
  for (let task of subtasks) {
    task["size"] = crawl(task.subtasks);
    size += task.size;
  }
  return size;
}

const tasks = dv.page("FamilyTree.md").file.tasks[0];
tasks["size"] = crawl(tasks.subtasks);

const width = 300;
const height = 150;
const ea = ExcalidrawAutomate;
ea.reset();

function buildMindmap(subtasks, depth, offset, parentObjectID) {
  if (subtasks.length == 0) return;
  let task;
  
  for (let i = 0; i < subtasks.length; i++) {
  task = subtasks[i]
  if (depth == 1) ea.style.strokeColor = '#'+(Math.random()*0xFFFFFF<<0).toString(16).padStart(6,"0");
    task["objectID"] = ea.addText((task.size/2+offset)*width,depth*height,task.text,{box:true})
    ea.connectObjects(parentObjectID,"top",task.objectID,"bottom",{startArrowHead: 'arrow', endArrowHead: 'dot'});
    if (i >= 1) {
            ea.connectObjects(subtasks[i-1]['objectID'],"right",task.objectID,"left", {endArrowHead: 'none'});
    }

    buildMindmap(task.subtasks, depth-1,offset,task.objectID);
    offset += task.size/1.5;
  }
 
}

tasks["objectID"] = ea.addText(width*1.5,height*(tasks.size-1),tasks.text,{box:true, textAlign:"center"});
buildMindmap(tasks.subtasks, 2, 0, tasks.objectID);

ea.createSVG().then((svg)=>dv.span(svg.outerHTML));
```