import scroll from "../../utils/scroll.js";
import print from "../../utils/print.js";
import save from "../../utils/save.js";

let wuppertalOne = async (cluster,page,positions,levels) => {
  try {


    await page.goto(
      "https://www.helios-gesundheit.de/kliniken/wuppertal/unser-haus-karriere-presse/karriere/stellenangebote/",
      "https://www.helios-gesundheit.de/kliniken/wuppertal/unser-haus-karriere-presse/karriere/stellenangebote/?tx_heliosuwstemplates_jobsearch%5Baction%5D=list&tx_heliosuwstemplates_jobsearch%5Bcontroller%5D=Job&tx_heliosuwstemplates_jobsearch%5Bpage%5D=2&cHash=dacf652f0a4905f03823ca092820ee4d",
      "https://www.helios-gesundheit.de/kliniken/wuppertal/unser-haus-karriere-presse/karriere/stellenangebote/?tx_heliosuwstemplates_jobsearch%5Baction%5D=list&tx_heliosuwstemplates_jobsearch%5Bcontroller%5D=Job&tx_heliosuwstemplates_jobsearch%5Bpage%5D=3&cHash=f58d93fedde7e147e7d4f52eed43e5d1",
      "https://www.helios-gesundheit.de/kliniken/wuppertal/unser-haus-karriere-presse/karriere/stellenangebote/?tx_heliosuwstemplates_jobsearch%5Baction%5D=list&tx_heliosuwstemplates_jobsearch%5Bcontroller%5D=Job&tx_heliosuwstemplates_jobsearch%5Bpage%5D=4&cHash=81aa6a60473889e8548a205757d0dab6",
      "https://www.helios-gesundheit.de/kliniken/wuppertal/unser-haus-karriere-presse/karriere/stellenangebote/?tx_heliosuwstemplates_jobsearch%5Baction%5D=list&tx_heliosuwstemplates_jobsearch%5Bcontroller%5D=Job&tx_heliosuwstemplates_jobsearch%5Bpage%5D=5&cHash=20268dcd0ca08b577c486bba485772f4",
      "https://www.helios-gesundheit.de/kliniken/wuppertal/unser-haus-karriere-presse/karriere/stellenangebote/?tx_heliosuwstemplates_jobsearch%5Baction%5D=list&tx_heliosuwstemplates_jobsearch%5Bcontroller%5D=Job&tx_heliosuwstemplates_jobsearch%5Bpage%5D=6&cHash=a760e30713594e972753eda4499f962f",
      "https://www.helios-gesundheit.de/kliniken/wuppertal/unser-haus-karriere-presse/karriere/stellenangebote/?tx_heliosuwstemplates_jobsearch%5Baction%5D=list&tx_heliosuwstemplates_jobsearch%5Bcontroller%5D=Job&tx_heliosuwstemplates_jobsearch%5Bpage%5D=7&cHash=0fd105302f8d307390dce0bb4da14681",
      "https://www.helios-gesundheit.de/kliniken/wuppertal/unser-haus-karriere-presse/karriere/stellenangebote/?tx_heliosuwstemplates_jobsearch%5Baction%5D=list&tx_heliosuwstemplates_jobsearch%5Bcontroller%5D=Job&tx_heliosuwstemplates_jobsearch%5Bpage%5D=8&cHash=331d73f05cea8be706bbffa28106d2e8",
      "https://www.helios-gesundheit.de/kliniken/wuppertal/unser-haus-karriere-presse/karriere/stellenangebote/?tx_heliosuwstemplates_jobsearch%5Baction%5D=list&tx_heliosuwstemplates_jobsearch%5Bcontroller%5D=Job&tx_heliosuwstemplates_jobsearch%5Bpage%5D=9&cHash=5bbf8705d29bbf2fccf0bb4f364f57cd",
      {
        waitUntil: "load",
        timeout: 0,
      }
    );

    await scroll(page);

    //get all jobLinks
    const jobLinks = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll("article.tabular-list__item > a ")
      ).map((el) => el.href);
    });

    console.log(jobLinks);
    let allJobs = [];

    for (let jobLink of jobLinks) {
      cluster.queue(async({page}) =>{
      let job = {
        title: "",
        location: "Wuppertal",
        hospital: "Helios Universitätsklinikum Wuppertal",
        link: "",
        level: "",
        position: "",
        email:"",
        republic:"North Rhine Westphelia",
        city:"Wuppertal"
      };

      await page.goto(jobLink, {
        waitUntil: "load",
        timeout: 0,
      });

      await page.waitForTimeout(1000);

      let title = await page.evaluate(() => {
        let ttitle = document.querySelector("h2.billboard-panel__title");
        return ttitle ? ttitle.innerText : "";
      });
      job.title = title;

      let text = await page.evaluate(() => {
        return document.body.innerText;
      });
      //get level
      let level = text.match(/Facharzt|Chefarzt|Assistenzarzt/);
      let position = text.match(/arzt|pflege/);
      job.level = level ? level[0] : "";
      if (
        level == "Facharzt" ||
        level == "Chefarzt" ||
        level == "Assistenzarzt" ||
        level == "Arzt" ||
        level == "Oberarzt"
      ) {
        job.position = "artz";
      }
      if (position == "pflege" || (position == "Pflege" && !level in levels)) {
        job.position = "pflege";
        job.level = "Nicht angegeben";
      }

      let link = await page.evaluate(() => {
        let lnk = document.querySelector(".button-form");
        lnk.click();
        let apply = document.querySelector("div.dialog__content > a");
        return apply ? apply.href : "";
      });
      job.link = link;
      if(positions.map(el => el.toLowerCase()).includes(job.position.toLowerCase())){
        await save(job);
      }
    });
    }
   
  } catch (e) {
    print(e);
  }
};



export default wuppertalOne;
