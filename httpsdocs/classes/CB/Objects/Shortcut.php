<?php
namespace CB\Objects;

use CB\DB;
use CB\Objects;

class Shortcut extends Object
{

    /**
     * target object id
     * @var int
     */
    protected $targetId = null;

    // public function __construct($id = null, $loadTemplate = false)
    // {
    //     if (is_numeric($id)) {
    //         $this->id = $id;
    //     }
    //     $this->loadTemplate = false;
    // }

    /**
     * create an object with specified params
     * @param  array $p object properties
     * @return int   created id
     */
    public function create($p = false)
    {
        if ($p === false) {
            $p = $this->data;
        }

        // check input params
        if (!isset($p['target_id'])) {
            throw new \Exception("No target id specified for shortcut creation", 1);
        }

        //check if target is also shortuc and replace with its target
        if (Objects::getType($p['target_id']) == 'shortcut') {
            $res = DB\dbQuery(
                'SELECT target_id
                FROM tree
                WHERE id = $1',
                $p['target_id']
            ) or die(DB\dbQueryError());
            if ($r = $res->fetch_assoc()) {
                $p['target_id'] = $r['target_id'];
            }
            $res->close();
        }

        $p['name'] = 'link to #' . $p['target_id'];

        if (empty($p['template_id'])) {
            $p['template_id'] = \CB\Config::get('default_shortcut_template');
        }

        $this->data = $p;

        return parent::create($p);
    }

    /**
     * load template custom data
     */
    protected function loadCustomData()
    {
        parent::loadCustomData();

        $d = &$this->data;

        if (empty($d['target_id'])) {
            return;
        }

        if (empty($d['data'])) {
            $d['data'] = array();
        }

        $d['target_type'] = Objects::getType($d['target_id']);
    }

    /**
     * update object
     * @param  array   $p optional properties. If not specified then $this-data is used
     * @return boolean
     */
    public function update($p = false)
    {
        if ($p === false) {
            $p = $this->data;
        }
        $this->data = $p;

        if (empty($p['template_id'])) {
            $p['template_id'] = \CB\Config::get('default_shortcut_template');
        }

        return parent::update($p);
    }
}
