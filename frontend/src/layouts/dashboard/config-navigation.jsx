import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {

  pdfArticles :icon('ic_pdfArticles'),
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  pipeline: icon('ic_pipeline'),
  sources: icon('ic_sources'),
  worker: icon('ic_worker'),
  warehouse: icon('ic_warehouse'),
  newspaper: icon('ic_newspaper'),
  tension: icon('ic_tension'),
  ejournal :icon('ic_ejournal'),
  tasks :icon('ic_tasks'),
  scheduler :icon('ic_scheduler'),
  tensionmeter :icon('ic_tensionmeter'),
  explore :icon('ic_explore'),
  notes :icon('ic_notes'),
  history :icon('ic_history'),
  index :icon('ic_index'),

};

// ----------------------------------------------------------------------

export function useNavData() {
  const data = useMemo(
    () => [

      
      {
        items: [

          { title: 'Daily Report', path: paths.dashboard.root, icon: ICONS.calendar },
          {
            title: 'Explore',
            path: paths.dashboard.considerations,
            icon: ICONS.explore, 
            children: [
              {
                title: 'Explore',
                path: paths.dashboard.considerations,
                icon: ICONS.explore, 
              },
              {
                title: 'E-journal',
                path: paths.dashboard.ejournal,
                icon: ICONS.ejournal, 
              },
                {
                title: 'Historical Events',
                path: paths.dashboard.historicalEvents,
                icon: ICONS.history, 
              },
          
    
           ],
          },
        ],
      },

      {
  //        subheader: 'overview v5.7.0',z
        items: [

          {
            title: 'Worker',
            path: paths.dashboard.worker,
            icon: ICONS.worker, 
            children: [
              { title: 'Worker', path: paths.dashboard.worker, icon: ICONS.worker },
              {
                title: 'Pipeline',
                path: paths.dashboard.pipeline,
                icon: ICONS.pipeline,
              },   
              {
                title: 'Tension',
                path: paths.dashboard.tension,
                icon: ICONS.tensionmeter,
              },
              {
                title: 'Monitor',
                path: paths.dashboard.monitor,
                icon: ICONS.blank,
              },
              {
                title: 'Real Time Events',
                path: paths.dashboard.realTimeEvents,
                icon: ICONS.blog,
              },
           ],
          },
          

         
          {
            title: 'Scheduler',
            path: paths.dashboard.scheduler,
            icon: ICONS.scheduler, 
          },
          {
            title: 'Academic PDFs ',
            path: paths.dashboard.pdfArticle,
            icon: ICONS.pdfArticles, 
          },
               {
            title: 'Media Scale Index',
            path: paths.dashboard.mediaScaleIndex,
            icon: ICONS.index, 
          },
       
        
        ],
      },

      // MANAGEMENT
      // ----------------------------------------------------------------------
      {
        items: [
          {
            title: 'Ressources',
            path: paths.dashboard.group.sources,
            icon: ICONS.sources,
            children: [
              { title: 'Manage Sources', path: paths.dashboard.group.sources },
              { title: 'Manage Groups', path: paths.dashboard.group.sourceGroups },
               { title: 'Manage Topics', path: paths.dashboard.group.topics },
                { title: 'Manage Podcasts', path: paths.dashboard.group.podcasts },
           ],
          },
        ],
      },

      {
        items: [
          {
            title: 'Data Warehouse ',
            path: paths.dashboard.group.warehouse,
            icon: ICONS.warehouse,
            children: [
              { title: 'Production Articles', path: paths.dashboard.group.warehouse },
              {
                title: 'Search',
                path: paths.dashboard.search,
               
              },
            ],
          },
      
          {
            title: 'Tasks',
            path: paths.dashboard.tasks,
            icon: ICONS.tasks, 
          },
          {
            title: 'Notes',
            path: paths.dashboard.notes,
            icon: ICONS.notes, 
          },
    
          {
            title: 'ThinkBoard',
            path: paths.dashboard.thinkboard,
            icon: ICONS.blog, 
          },

 
        ],


      },


  
      

    ],
    []
  );

  
  return data;
}